import React from "react";
import axios from "axios";
import { configs } from "../../../../globals";
import { makeStyles, Card, Avatar, CardContent, Typography, CardHeader, Button, Dialog, DialogTitle, DialogContent, DialogContentText, TextField, DialogActions, InputAdornment, Link } from '@material-ui/core';
import { green } from "@material-ui/core/colors";
import Alert from "@material-ui/lab/Alert";

const useStyles = makeStyles((theme) => ({
    root: {
        textAlign: 'center'
    },
    media: {
        height: 0,
        paddingTop: '56.25%', // 16:9
    },
    expand: {
        transform: 'rotate(0deg)',
        marginLeft: 'auto',
        transition: theme.transitions.create('transform', {
            duration: theme.transitions.duration.shortest,
        }),
    },
    avatar: {
        backgroundColor: green[500],
    },
}));

const Question = (props) => {

    const { question, setLoading, info, fetchQuestions, contestId, setSnack } = props;
    const [flag, setFlag] = React.useState("");
    const classes = useStyles();
    const [open2, setOpen2] = React.useState(false);
    const [open, setOpen] = React.useState(false);

    const submitFlag = () => {
        if(!info.isFlag) return;
        setLoading(true);
        axios.post(`${configs.baseUrl}/user/solveQuestion/${contestId}/${question.title}`, {flag}).then(
            result => {
                if(result.data.status)
                    fetchQuestions();
                else
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

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = (f) => {
        setOpen(false);
        if(f)
            submitFlag();
    };

    const handleClickOpen2 = () => {
        setOpen2(true);
    };

    const handleClose2 = () => {
        setOpen2(false);
    };

    return (
        <>
            <Card>
                <CardHeader
                    avatar={<Avatar aria-label="recipe" className={classes.avatar}>{question.points}</Avatar>}
                    title={question.title}
                    subheader={question.author}
                />
                <CardContent>
                    <Typography color="textSecondary" paragraph style={{ textAlign: 'justify', whiteSpace: 'pre-line', wordBreak: 'break-word' }}>
                        {question.description.substring(0, 200)}{question.description.length >= 200 ? " ..." : ""}
                    </Typography>
                        <br />
                    <Typography color="textSecondary" paragraph style={{ textAlign: 'center', whiteSpace: 'pre-line', wordBreak: 'break-word' }}>
                        {question.description.length >= 200 && <><Button variant="contained" onClick={handleClickOpen2}>Read Full Statement</Button><br /><br /></>}
                        {!question.solved && <><Button variant="contained" color="secondary" onClick={handleClickOpen} disabled={!info.isFlag}>Submit Flag</Button><br /></>}
                        {question.solved && <Alert variant="outlined" severity="success">Solved</Alert>}
                        <br />
                        <i>{question.questionFile.length ? "Files for this question:" : "No files for this question"}</i>
                        <br />
                        {
                            question.questionFile.map(f => {
                                return <React.Fragment key={f}>
                                    <Link href={`${configs.baseUrl}/common/getFile/${question.title}/${f}`} color="error">{f}</Link>
                                    <br />
                                </React.Fragment>
                            })
                        }
                    </Typography>
                </CardContent>
            </Card>
            <Dialog open={open} onClose={() => handleClose(false)} maxWidth="md" aria-labelledby="form-dialog-title">
                <DialogTitle id="form-dialog-title">{question.title}</DialogTitle>
                <DialogContent>
                    <TextField margin="dense" id="f" label="Enter the Flag" type="text" fullWidth
                        InputProps={{
                            startAdornment: <InputAdornment position="start">Edge2k21{"{"}</InputAdornment>,
                            endAdornment: <InputAdornment position="end">{"}"}</InputAdornment>,
                        }}
                        onInput={($e) => setFlag($e.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => handleClose(false)}> Close </Button>
                    <Button onClick={() => handleClose(true)} disabled={!info.isFlag}> Submit Flag  </Button>
                </DialogActions>
            </Dialog>
            <Dialog open={open2} onClose={handleClose2} maxWidth="sm" aria-labelledby="form-dialog-title">
                <DialogTitle id="form-dialog-title">{question.title}</DialogTitle>
                <DialogContent>
                    <DialogContentText style={{ textAlign: 'justify', whiteSpace: 'pre-line', wordBreak: 'break-word' }}> {question.description} </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose2}> Close </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}

export default Question;