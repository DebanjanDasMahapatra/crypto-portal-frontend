import React from 'react';
import axios from "axios";
import { configs } from "../../../globals";
import { makeStyles } from '@material-ui/core/styles';
import { List, ListItem, ListItemText, Container, Paper } from '@material-ui/core';

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

const Announcement = (props) => {
    const { history, setLoading, setSnack, socket,announcements, setAnnouncements} = props;
    const dateTimeFormat = new Intl.DateTimeFormat('en', { weekday: 'long', year: 'numeric', month: 'long', day: '2-digit', hour: 'numeric', minute: 'numeric', second: 'numeric' });
    const classes = useStyles();
    const [auth, setAuth] = React.useState(false);
    const [id, setId] = React.useState(props.match.params.cid);
    
    const fetchAnnouncements = () => {
        axios.get(`${configs.baseUrl}/common/getAllAnnouncement/${id}`).then(
            result => {
                if (result.data.status) {
                    setAnnouncements({ ...announcements, [id]: result.data.data.reverse() });
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
        if (!configs.isUser()) {
            setAuth(false);
            history.push('/');
        } else {
            setAuth(true);
            document.title = "CryptoQuest|Announcement"
        }
    }, [configs.isUser()]);

    return (
        <Container fixed style={{opacity: 0.9}}>
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

export default Announcement;