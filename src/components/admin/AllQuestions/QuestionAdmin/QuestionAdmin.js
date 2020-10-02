import React from "react";
import axios from "axios";
import { configs } from "../../../../globals";
import { makeStyles, Card, Avatar, IconButton, CardContent, Typography, CardActions, CardHeader, Button, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Link } from '@material-ui/core';
import CreateIcon from '@material-ui/icons/Create';
import InfoIcon from '@material-ui/icons/Info';
import DeleteIcon from '@material-ui/icons/Delete';
import { green } from "@material-ui/core/colors";

const useStyles = makeStyles((theme) => ({
    media: {
        height: 0,
        paddingTop: '56.25%', // 16:9
    },
    expand: {
        marginLeft: 'auto',
        transition: theme.transitions.create('transform', {
            duration: theme.transitions.duration.shortest,
        }),
    },
    avatar: {
        backgroundColor: green[500],
    },
}));

const QuestionAdmin = (props) => {

    const { question, history, setLoading, setSnack, fetchQuestions, openConfirmation } = props;
    const classes = useStyles();
    const [isDesc, setIsDesc] = React.useState(true);
    const [open2, setOpen2] = React.useState(false);

    const handleClickOpen2 = (isD) => {
        setIsDesc(isD);
        setOpen2(true);
    };

    const handleClose2 = () => {
        setOpen2(false);
    };

    const editQuestion = () => {
        history.push('/question/notselected/' + question.title);
    }

    const deleteQuestion = () => {
        setLoading(true);
        let deletions = [];
        question.questionFile.forEach(qf => deletions.push(axios.delete(`${configs.baseUrl}/admin/deleteFile/${question.title}/${qf}`)));
        axios.all(deletions).then(delRes => {
            if(delRes.find(dr => !dr.data.status)){
                setSnack({ show: true, msg: "Some Files can't be deleted", status: false });
                setLoading(false);
            } else 
            axios.delete(`${configs.baseUrl}/admin/deleteQuestion/${question.title}`).then(
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
        }).catch(
            error => {
                setSnack({ show: true, msg: "Failed to Connect to the Server...", status: false });
                setLoading(false);
            }
        )
    }

    const delQ = () => {
        openConfirmation({title: "Confirm", content: `Sure to Delete the Question ${question.title}?`, positiveButtonText: "YES", negativeButtonText: "NO", cb: deleteQuestion})
    };

    return (
        <>
            <Card>
                <CardHeader
                    avatar={<Avatar aria-label="recipe" className={classes.avatar}> {question.points} </Avatar>}
                    title={question.title}
                    subheader={question.author}
                />
                <CardContent>
                    <Typography color="textSecondary" paragraph style={{ textAlign: 'justify', whiteSpace: 'pre-line', wordBreak: 'break-word' }}>
                        {question.description.substring(0, 200)}{question.description.length >= 200 ? " ..." : ""}
                    </Typography>
                    <Typography color="textSecondary" style={{ textAlign: 'center', whiteSpace: 'pre-line', wordBreak: 'break-word' }}>
                        {question.description.length >= 200 && <><Button variant="contained"  onClick={() => handleClickOpen2(true)}>Read Full Statement</Button><br /></>}<br />
                        <i>{question.questionFile.length ? "File(s) for this question:" : "No file(s) for this question"}</i>
                        <br />
                        {
                            question.questionFile.map(f => {
                                return <React.Fragment key={f}>
                                    <Link href={`${configs.baseUrl}/common/getFile/${question.title}/${f}`} color="error">{f}</Link>
                                    <br />
                                </React.Fragment>
                            })
                        }
                        <br />
                        <code>{question.flag}</code>
                    </Typography>
                </CardContent>
                <CardActions disableSpacing hidden={!configs.isAdmin()}>
                    <IconButton onClick={editQuestion}>
                        <CreateIcon />
                    </IconButton>
                    <IconButton onClick={delQ}>
                        <DeleteIcon />
                    </IconButton>
                    {question.solves && <IconButton className={classes.expand} onClick={() => handleClickOpen2(false)} aria-expanded={open2} aria-label="show more">
                        <InfoIcon />
                    </IconButton>}
                </CardActions>
            </Card>
            <Dialog open={open2} onClose={handleClose2} maxWidth="md" aria-labelledby="form-dialog-title">
                <DialogTitle id="form-dialog-title">{isDesc ? question.title : "Solved by:"}</DialogTitle>
                <DialogContent>
                    {
                        !isDesc && question.solves.map(f => <DialogContentText key={f} style={{ textAlign: 'justify', whiteSpace: 'pre-line', wordBreak: 'break-word' }}> {f} </DialogContentText>)
                    }
                    {
                        isDesc && <DialogContentText style={{ textAlign: 'justify', whiteSpace: 'pre-line', wordBreak: 'break-word' }}> {question.description} </DialogContentText>
                    }
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose2}> Close </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}

export default QuestionAdmin;