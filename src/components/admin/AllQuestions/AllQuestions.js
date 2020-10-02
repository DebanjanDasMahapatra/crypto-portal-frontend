import React from "react";
import axios from "axios";
import QuestionAdmin from "./QuestionAdmin/QuestionAdmin";
import { configs } from "../../../globals";
import { makeStyles, Grid, Container, Paper, Typography } from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
    root2: {
        flexGrow: 1,
    },
    cent: {
        textAlign: 'center'
    },
    paper: {
        padding: theme.spacing(2),
        textAlign: 'center',
        color: theme.palette.text.secondary,
    },
}));

const AllQuestions = (props) => {

    const { history, setLoading, setSnack, openConfirmation,socket } = props;
    const [auth, setAuth] = React.useState(false);
    const classes = useStyles();

    const [questions, setQuestions] = React.useState([]);
    const [count, setCount] = React.useState(0);
    const [id, setId] = React.useState(props.match.params.cid);

    const fetchQuestions = () => {
        setLoading(true);
        if(id !== 'all')
        axios.all([axios.get(`${configs.baseUrl}/admin/getContestQuestion/${id}`), axios.get(`${configs.baseUrl}/admin/getSolves/${id}`)])
            .then(axios.spread((ques, sol) => {
                if (ques.data.status && sol.data.status) {
                    let qs = ques.data.data, co = 0;
                    qs.map(q => {
                        q.solves = [];
                        co += q.points;
                        sol.data.data.forEach(s =>{
                            if(q.title === s.questionTitle)
                                q.solves.push(s.userEmail)
                        });
                    });
                    setQuestions(qs);
                    setCount(co);
                    setLoading(false);
                    setSnack({ show: true, msg: ques.data.message, status: ques.data.status });
                }
                else {
                    setSnack({ show: true, msg: ques.data.message + " | " + sol.data.message, status: false });
                    setLoading(false);
                    if(ques.status === 401 || sol.status === 401)
                        configs.logout(socket);
                }
            })).catch(
                error => {
                    setSnack({ show: true, msg: "Failed to Connect to the Server...", status: false });
                    setLoading(false);
                }
            );
        else
            axios.get(`${configs.baseUrl}/admin/getAllQuestion`).then(
                result => {
                    if (result.data.status) {
                        let qs = result.data.data, co = 0;
                        qs.forEach(c => co += c.points);
                        setQuestions(qs);
                        setCount(co);
                    }
                    else {
                        if(result.status === 401)
                        {
                            configs.logout(socket);
                        }
                    }
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
        if (!configs.isAdmin()) {
            history.push('/');
            setAuth(false);
        }
        else {
            setAuth(true);
            document.title="CryptoQuest|All Questions";
        }
    }, [configs.isAdmin()]);

    React.useEffect(() => {
        if (!auth) return;
        setId(props.match.params.cid);
        setLoading(true);
        fetchQuestions();
    }, [props.match.params.cid, auth]);

    return (
        <>
            <br />
            <Grid container spacing={2}>
                <Grid item xs={6}>
                    <Typography variant="h5" color="secondary" className={classes.cent}>Total Questions: <b>{questions.length}</b></Typography>
                </Grid>
                <Grid item xs={6}>
                    <Typography variant="h5" color="secondary" className={classes.cent}>Total Points: <b>{count}</b></Typography>
                </Grid>
            </Grid>
            <br />
            <Container maxWidth="lg" style={{opacity: 0.9}}>
                <div className={classes.root2}>
                    {
                        questions.length === 0 && <div className="force-center"><i><Typography variant="h5" color="secondary">No questions in this contest yet</Typography></i></div>
                    }
                    <Grid container spacing={5}>
                        {
                            questions.map(q => {
                                return <Grid item sm={4} key={q._id}>
                                    <Paper elevation={10}>
                                        <QuestionAdmin {...props} question={q} fetchQuestions={fetchQuestions} openConfirmation={openConfirmation} setLoading={setLoading} />
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

export default AllQuestions;