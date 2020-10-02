import React from "react";
import axios from "axios";
import Question from "./Question/Question";
import { configs } from "../../../globals";
import { makeStyles, Grid, Container, Paper } from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
    root: {
        flexGrow: 1,
    },
    paper: {
        padding: theme.spacing(2),
        textAlign: 'center',
        color: theme.palette.text.secondary,
    },
    active: {
        background: 'lightblue'
    }
}));

const ViewQuestion = (props) => {

    const { history, setLoading, setSnack, globalTime,socket } = props;
    const classes = useStyles();

    const [auth, setAuth] = React.useState(false);
    const [questions, setQuestions] = React.useState([]);
    const [contestId, setContestId] = React.useState(props.match.params.cid);
    const [info, setInfo] = React.useState(null);
    const [contestInfo, setContestInfo] = React.useState(null);

    const doTheMapping = (ques, sols) => {
        let quess = ques;
        quess.map(q => {
            q.solved = sols.find(s => s.questionTitle === q.title) !== undefined;
        });
        setQuestions(quess);
    }

    const fetchQuestions = () => {
        if (questions.length === 0)
            axios.all([axios.get(`${configs.baseUrl}/common/getContestQuestion/${contestId}`), axios.get(`${configs.baseUrl}/common/getSolution/${contestId}`)])
                .then(axios.spread((ques, sols) => {
                    if (ques.data.status && sols.data.status) {
                        setInfo(configs.flagRank(ques.data.data.contestInfo, globalTime));
                        setContestInfo(ques.data.data.contestInfo);
                        doTheMapping(ques.data.data.questions, sols.data.data);
                        setSnack({ show: true, msg: "Succesfully Retrieved Users and Contest", status: true });
                    }
                    else {
                        setSnack({ show: true, msg: ques.data.message + " | " + sols.data.message, status: false });
                        if(ques.status === 401 || sols.status === 401)
                            configs.logout(socket);
                    }
                    setLoading(false);
                })).catch(
                    error => {
                        setSnack({ show: true, msg: "Failed to Connect to the Server...", status: false });
                        setLoading(false);
                    }
                )
        else
            axios.get(`${configs.baseUrl}/common/getSolution/${contestId}`).then(
                result => {
                    if (result.data.status) {
                        doTheMapping(questions,result.data.data);
                    }
                    else
                        if(result.status === 401)
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
        if (!configs.isUser()) {
            setAuth(false);
            history.push('/');
        } else
        {
            setAuth(true);
            document.title="Cryptoquest|View Question";
        }
    },[configs.isUser()]);

    React.useEffect(() => {
        if (contestInfo) setInfo(configs.flagRank(contestInfo, globalTime));
    }, [contestInfo, globalTime]);

    React.useEffect(() => {
        if (!auth) return;
        setLoading(true);
        setContestId(props.match.params.cid)
        fetchQuestions();
    }, [props.match.params.cid, auth]);

    return (
        <>
            <br />
            <Container maxWidth="lg">
                <div className={classes.root}>
                    <Grid container spacing={5}>
                        {
                            info && questions.map(q => {
                                return <Grid item md={4} key={q._id} style={{opacity: 0.9}}>
                                    <Paper elevation={10}>
                                        <Question {...props} question={q} contestId={contestId} info={info} setSnack={setSnack} fetchQuestions={fetchQuestions} />
                                    </Paper>
                                </Grid>
                            })
                        }
                    </Grid>
                </div>
            </Container>
        </>
    );
}

export default ViewQuestion;