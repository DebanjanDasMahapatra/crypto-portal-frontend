import React from "react";
import axios from "axios";
import clsx from "clsx";
import "./Styles.css";
import { configs } from "../../../globals";
import SendIcon from '@material-ui/icons/Send';
import { makeStyles, Container, IconButton, InputAdornment, FormControl, InputLabel, Input } from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
    root: {
        background: theme.palette.background.paper,
        height: window.screen.height * 0.56,
        overflowY: 'auto',
        opacity: 0.9
    },
    self: {
        marginLeft: 'auto',
        maxWidth: '70%',
        width: 'max-content'
    },
    others: {
        marginRight: 'auto',
        maxWidth: '70%',
        width: 'max-content'
    },
    typer: {
        background: theme.palette.background.paper,
        paddingTop: window.screen.height * 0.02,
        paddingBottom: window.screen.height * 0.02
    }
}));

const Discussions = (props) => {

    const { history, globalTime, setLoading, setSnack, socket, discussions, setDiscussions } = props;
    const dateTimeFormat = new Intl.DateTimeFormat('en', { weekday: 'long', year: 'numeric', month: 'long', day: '2-digit', hour: 'numeric', minute: 'numeric', second: 'numeric' });

    const [message, setMessage] = React.useState('')
    const [auth, setAuth] = React.useState(false);
    const [id, setId] = React.useState(props.match.params.cid);
    const arena = React.useRef(null);
    const classes = useStyles();

    const addDiscussion = () => {
        let msg = { sender: 'ADMIN', message: message.trim(), createdAt: globalTime };
        socket.emit('discussion', { cid: id, msg });
        setDiscussions((prevDisc) => ({
            ...prevDisc,
            [`${id}`]: [...prevDisc[`${id}`] || [], msg]
        }));
        axios.post(`${configs.baseUrl}/admin/addDiscussion/${id}`, msg).then(result => {
            if (result.data.status)
                setMessage('')
            else
                setSnack({ show: true, msg: result.data.message + " | Please Reload the Page", status: result.data.status });
        }).catch(error => {
            setSnack({ show: true, msg: "Failed to Connect to the Server...", status: false });
        });
    }

    const fetchDiscussions = () => {
        axios.get(`${configs.baseUrl}/admin/getAllDiscussion/${id}`).then(
            result => {
                if (result.data.status)
                    setDiscussions({ ...discussions, [id]: result.data.data });
                else {
                    if (result.status === 401)
                        configs.logout(socket);
                    setLoading(false);
                }
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
        if(!auth)   return;
        else {
            if (discussions[id]) return;
            setLoading(true);
            fetchDiscussions();
        }
    }, [auth,discussions]);

    React.useEffect(() => {
        if (arena !== null && discussions[id]) {
            setLoading(false);
            arena.current.scrollIntoView({ behaviour: 'smooth' });
        }
    }, [arena, discussions]);

    React.useEffect(() => {
        if (!configs.isAdmin()) {
            setAuth(false);
            history.push('/');
        } else {
            setAuth(true);
            document.title = "CryptoQuest|Discussions"
        }
    }, [configs.isAdmin()]);

    return (
        <>
            <Container fixed className={classes.root}>
                {
                    id && discussions[id] && discussions[id].map(r => <React.Fragment key={r.createdAt}>
                        <div className={clsx('sender', { 'sender-self': r.sender === 'ADMIN', 'sender-other': r.sender !== 'ADMIN', 's-admin': r.sender === 'ADMIN' })}>
                            {r.sender}
                        </div>
                        <div className={clsx('bubble', { 'self': r.sender === 'ADMIN', 'other': r.sender !== 'ADMIN', 'admin': r.sender === 'ADMIN' })} dangerouslySetInnerHTML={{__html: r.message.replace(/\n/g,"<br />")}}></div>
                        <div className={clsx('sender', { 'sender-self': r.sender === 'ADMIN', 'sender-other': r.sender !== 'ADMIN' })}>
                            {dateTimeFormat.format(new Date(r.createdAt))}
                        </div>
                        <br />
                    </React.Fragment>)
                }
                <div ref={arena}></div>
            </Container>
            <Container fixed className={classes.typer}>
                <FormControl fullWidth>
                    <InputLabel htmlFor="standard-adornment-password">Type your query here...</InputLabel>
                    <Input
                        id="standard-adornment-password"
                        onInput={$e => setMessage($e.target.value)}
                        value={message.trimLeft()}
                        multiline
                        endAdornment={
                            <InputAdornment position="end"> <IconButton onClick={addDiscussion} aria-label="toggle password visibility" disabled={message.trim() === ''}> <SendIcon /> </IconButton> </InputAdornment>
                        }
                    />
                </FormControl>
            </Container>
        </>
    );
};

export default Discussions;
