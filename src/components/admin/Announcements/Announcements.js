import React from 'react';
import axios from "axios";
import { configs } from "../../../globals";
import { makeStyles } from '@material-ui/core/styles';
import { List, ListItem, ListItemText, Container, IconButton, InputAdornment, FormControl, InputLabel, Input, Paper } from '@material-ui/core';
import RecordVoiceOverIcon from '@material-ui/icons/RecordVoiceOver';

const useStyles = makeStyles((theme) => ({
    root: {
        width: '100%',
    },
    message: {
        color: theme.palette.text.primary,
        marginRight: 'auto',
        width: '100%',
    },
    timest: {
        marginLeft: 'auto',
        color: theme.palette.text.secondary
    },
}));

const Announcements = (props) => {
    const { history,globalTime, setLoading, setSnack, socket,announcements, setAnnouncements} = props;
    const dateTimeFormat = new Intl.DateTimeFormat('en', { weekday: 'long', year: 'numeric', month: 'long', day: '2-digit', hour: 'numeric', minute: 'numeric', second: 'numeric' });
    const classes = useStyles();
    const [auth, setAuth] = React.useState(false);
    const [id, setId] = React.useState(props.match.params.cid);
    const [msg, setMsg] = React.useState('');

    const addAnnouncement = () => {
        let message = { message: msg.trim(), createdAt: globalTime };
        socket.emit('announcement', { cid: id, msg:message });
        setAnnouncements((prevAnnounce) => ({
            ...prevAnnounce,
            [`${id}`]: [message,...prevAnnounce[`${id}`] || []]
        }));
        axios.post(`${configs.baseUrl}/admin/addAnnouncement/${id}`, {
            message: msg.trim()
        }).then(result => {
            if (result.data.status) {
                setMsg('')
            }
            else
                setSnack({ show: true, msg: result.data.message, status: result.data.status });
        }).catch(error => {
            setSnack({ show: true, msg: "Failed to Connect to the Server...", status: false });
            setLoading(false);
        });
    }

    const fetchAnnouncements = () => {
        axios.get(`${configs.baseUrl}/admin/getAllAnnouncement/${id}`).then(
            result => {
                if (result.data.status) {
                    setAnnouncements({ ...announcements, [id]: result.data.data.reverse() });
                    setMsg('');
                }
                else
                    if (result.status === 401)
                        configs.logout(socket);
                setLoading(false);
                setSnack({ show: true, msg: result.data.message, status: result.data.status });
            }
        ).catch(
            error => {
                setSnack({ show: true, msg: "Failed to Connect to the Server...", status: false });
                setLoading(false);
            }
        )
    }

    React.useEffect(() => {
        if (!auth) return;
        else {
            if (announcements[id]) return;
            setLoading(true);
            fetchAnnouncements();
        }
    }, [auth,announcements]);

    React.useEffect(() => {
        if (!configs.isAdmin()) {
            setAuth(false);
            history.push('/');
        } else {
            setAuth(true);
            document.title = "CryptoQuest|Admin|Announcements"
        }
    }, [configs.isAdmin()]);

    return (
        <Container fixed style={{opacity: 0.9}}>
            <FormControl fullWidth>
                <InputLabel htmlFor="standard-adornment-password">Type your announcement here...</InputLabel>
                <Input
                    id="standard-adornment-password"
                    onInput={$e => setMsg($e.target.value)}
                    value={msg.trimLeft()}
                    multiline
                    endAdornment={
                        <InputAdornment position="end"> <IconButton onClick={addAnnouncement} aria-label="toggle password visibility" disabled={msg.trim() === ""}> <RecordVoiceOverIcon /> </IconButton> </InputAdornment>
                    }
                />
            </FormControl>
            {id && announcements[id] && 
            <List className={classes.root}>
                {
                    announcements[id].map(a => <React.Fragment key={a.createdAt}><br />
                        <Paper elevation={10}>
                            <ListItem>
                                <ListItemText className={classes.message}>
                                    <span dangerouslySetInnerHTML={{ __html: a.message.replace(/\n/g,"<br />") }}></span>
                                </ListItemText>
                            </ListItem>
                            <ListItem>
                                <div className={classes.timest}> {dateTimeFormat.format(new Date(a.createdAt))} </div>
                            </ListItem>
                        </Paper>
                    </React.Fragment>)
                }
            </List>}
        </Container>
    );
}

export default Announcements;