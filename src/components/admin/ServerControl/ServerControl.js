import React from 'react';
import axios from "axios";
import { configs } from "../../../globals";
import "./Styles.css";
import { makeStyles } from '@material-ui/core/styles';
import { Container, Grid, Typography, TextField, Button, Paper } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
    root: {
        width: '100%',
        padding: '1%'
    },
    cent: {
        textAlign: 'center'
    },
    label: {
        color: theme.palette.text.secondary
    },
}));

const ServerControl = (props) => {
    const { history, setLoading, setSnack, socket } = props;
    const classes = useStyles();
    const [auth, setAuth] = React.useState(false);
    const [logs, setLogs] = React.useState("");
    const [command, setCommand] = React.useState("");

    const execCommand = () => {
        axios.post(`${configs.baseUrl}/access/csoenrtvreorl`,{command})
            .then(result => {
                setSnack({ show: true, msg: result.data.message, status: result.data.status });
                if (result.data.status) {
                    setCommand("");
                    setLogs(prevLogs => prevLogs + "<br /><br />--------OUTPUT--------<br /><br />" + result.data.data.trim());
                }
                else
                    setLogs(prevLogs => prevLogs + "<br /><br />--------OUTPUT--------<br /><br />" + result.data.stderr.trim());
                setLoading(false);
            }).catch(
                error => {
                    setSnack({ show: true, msg: "Failed to Connect to the Server...", status: false });
                    setLoading(false);
                }
            )
    }

    React.useEffect(() => {
        if (!auth) return;
    }, [auth]);

    React.useEffect(() => {
        if (!configs.isAdmin()) {
            setAuth(false);
            history.push('/');
        } else {
            setAuth(true);
            document.title = "CryptoQuest|Server Control"
        }
    }, [configs.isAdmin()]);

    return (
        <Container fixed>
            <br />
            <Grid container spacing={10}>
                <Grid item md={6} component={Paper} style={{opacity: 0.9}}>
                    <Typography variant="h4" color="secondary" className={classes.cent}>Run Command</Typography>
                    <br />
                    <TextField className="command-arena" fullWidth label="Type the command here" multiline onChange={$e => setCommand($e.target.value)} value={command} />
                    <br />
                    <br />
                    <div className={classes.cent}>
                        <Button onClick={execCommand} disabled={command === ""}>RUN</Button>
                        <Button onClick={() => setLogs("")}>CLEAR LOGS</Button>
                    </div>
                </Grid>
                <Grid item md={6} component={Paper} style={{opacity: 0.9}}>
                    <Typography variant="h4" color="primary" className={classes.cent}>Logs</Typography>
                    <br />
                    <div className="command-arena" dangerouslySetInnerHTML={{__html: logs.replace(/\r\n/g,"<br />").replace(/\n/g,"<br />")}}></div>
                </Grid>
            </Grid>
        </Container>
    );
}

export default ServerControl;