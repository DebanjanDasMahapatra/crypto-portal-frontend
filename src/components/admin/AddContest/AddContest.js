import React from "react";
import axios from "axios";
import "./AddContest.css";
import { configs } from "../../../globals";
import DateFnsUtils from '@date-io/date-fns';
import {
    MuiPickersUtilsProvider,
    KeyboardTimePicker,
    KeyboardDatePicker,
} from '@material-ui/pickers';
import { Button, TextField, FormControlLabel, Switch, Grid, makeStyles, Paper, Typography } from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
    root: {
        flexGrow: 1,
        textAlign: "center"
    },
    paper: {
        padding: theme.spacing(2),
        color: theme.palette.text.secondary,
        opacity: 0.9
    },
}));

const AddContest = (props) => {

    const { history, setLoading, setSnack, openConfirmation, socket } = props;
    const classes = useStyles();

    const [contest, setContest] = React.useState({
        name: "",
        description: "",
        startTime: new Date(),
        endTime: new Date(),
        imageUrl: "",
        rules: "",
        rankList: {
            show: false,
            automaticHide: false,
            timeOfHide: new Date()
        }
    });

    const [id, setId] = React.useState(props.match.params.cid);
    const [auth, setAuth] = React.useState(false);

    const changeST = date => setContest({...contest, startTime: date});
    const changeET = date => setContest({...contest, endTime: date});
    const changeHT = date => setContest({...contest, rankList: {...contest.rankList, timeOfHide: date}});

    const loadData = () => {
        console.log(id);
        axios.get(`${configs.baseUrl}/admin/getContest/${id}`).then(
            result => {
                setLoading(false);
                setSnack({ show: true, msg: result.data.message, status: result.data.status });
                if (result.data.status) {
                    const { _id, name, description, startTime, endTime, imageUrl, rules, rankList } = result.data.data;
                    setContest({ name, description, startTime, endTime, imageUrl, rules, rankList });
                    setId(name);
                }
                else {
                    if(result.status === 401)
                        configs.logout(socket);
                }
            }
        ).catch(
            error => {
                setSnack({ show: true, msg: "Failed to Connect to the Server...", status: false });
                setLoading(false);
            }
        )
    }

    const addContest = () => {
        setLoading(true);
        axios.post(`${configs.baseUrl}/admin/addContest`, contest).then(result => {
            setSnack({ show: true, msg: result.data.message, status: result.data.status })
            if (result.data.status) {
                socket.emit('new-contest-added', { name: contest.name, cid: result.data.cid });
                localStorage.setItem('contestInfo', JSON.stringify([...JSON.parse(localStorage.getItem('contestInfo')), result.data.cid]));
                resetAll();
            }
            else
                setLoading(false);
        }).catch(error => {
            setSnack({ show: true, msg: "Failed to Connect to the Server...", status: false })
            setLoading(false);
        });
    };

    const addC = () => {
        openConfirmation({ title: "Confirm", content: "Sure to Add the Contest?", positiveButtonText: "YES", negativeButtonText: "NO", cb: addContest })
    };

    const editContest = () => {
        setLoading(true);
        axios.put(`${configs.baseUrl}/admin/editContest/` + id, contest).then(result => {
            setSnack({ show: true, msg: result.data.message, status: result.data.status });
            if (result.data.status) {
                console.log({ name: contest.name, cid: id });
                socket.emit('contest-edited', { name: contest.name, cid: id });
                loadData();
            }
            else
                setLoading(false);
        }).catch(error => {
            setSnack({ show: true, msg: "Failed to Connect to the Server...", status: false });
            setLoading(false);
        });
    };

    const editC = () => {
        openConfirmation({ title: "Confirm", content: `Save changes for the Contest ${contest.name}?`, positiveButtonText: "YES", negativeButtonText: "NO", cb: editContest })
    };

    const resetAll = () => {
        setContest({
            name: "",
            description: "",
            startTime: new Date(),
            endTime: new Date(),
            imageUrl: "",
            rules: "",
            rankList: {
                show: false,
                automaticHide: false,
                timeOfHide: new Date()
            }
        });
        setLoading(false);
    }

    React.useEffect(() => {
        if (!configs.isAdmin()) {
            setAuth(false);
            history.push('/');
        } else {
            setAuth(true);
            document.title="CryptoQuest|Add Question";
        }
    }, [configs.isAdmin()]);

    React.useEffect(() => {
        if (!auth) return;
        setId(props.match.params.cid);
    }, [props.match.params.cid, auth]);

    React.useEffect(() => {
        resetAll();
        if (id !== 'new') {
            setLoading(true);
            loadData();
        }
    },[id])

    return (
        <>
            <div className={classes.root}>
                <Grid container spacing={3}>
                    <Grid item md={3} className="force100"></Grid>
                    <Grid item md={6} className="force100">
                        <Paper className={classes.paper} elevation={10}>
                            <Typography variant="h5" color="secondary">{id === 'new' ? "Create New Contest" : `Edit Contest`}</Typography>
                            {id !== 'new' && <h5><code>{id}</code></h5>}
                            <br /><br />
                            <TextField variant="outlined" margin="dense" id="r1" label="Name" type="text" fullWidth onInput={$e => setContest({ ...contest, name: $e.target.value })} value={contest.name} disabled={id !== 'new'} />
                            {id === 'new' && <small><i>Once the contest is added, you can't change the name !!!</i></small>}
                            <br /><br />
                            <TextField variant="outlined" margin="dense" id="r2" label="Description" type="text" fullWidth onInput={$e => setContest({ ...contest, description: $e.target.value })} value={contest.description} />
                            <br /><br />
                            <TextField variant="outlined" margin="dense" id="r6" label="Rules" type="text" multiline fullWidth onInput={$e => setContest({ ...contest, rules: $e.target.value })} value={contest.rules} />
                            <br /><br />
                            <Typography>Starts at:</Typography>
                            <MuiPickersUtilsProvider utils={DateFnsUtils}>
                                <Grid container justify="space-around">
                                    <KeyboardDatePicker margin="normal" id="dpd1" label="Set Date" format="MM/dd/yyyy" value={contest.startTime} onChange={changeST} KeyboardButtonProps={{ 'aria-label': 'change date' }} />
                                    <KeyboardTimePicker margin="normal" id="tp1" label="Set Time" value={contest.startTime} onChange={changeST} KeyboardButtonProps={{ 'aria-label': 'change time' }} />
                                </Grid>
                            </MuiPickersUtilsProvider>
                            <br /><br />
                            <Typography>Ends at:</Typography>
                            <MuiPickersUtilsProvider utils={DateFnsUtils}>
                                <Grid container justify="space-around">
                                    <KeyboardDatePicker margin="normal" id="dpd2" label="Set Date" format="MM/dd/yyyy" value={contest.endTime} onChange={changeET} KeyboardButtonProps={{ 'aria-label': 'change date' }} />
                                    <KeyboardTimePicker margin="normal" id="tp2" label="Set Time" value={contest.endTime} onChange={changeET} KeyboardButtonProps={{ 'aria-label': 'change time' }} />
                                </Grid>
                            </MuiPickersUtilsProvider>
                            <br /><br />
                            <TextField variant="outlined" margin="dense" id="r5" label="Image URL" type="text" fullWidth onInput={$e => setContest({ ...contest, imageUrl: $e.target.value })} value={contest.imageUrl} />
                            <br /><br />
                            <FormControlLabel control={<Switch checked={contest.rankList.show} onClick={() => setContest({ ...contest, rankList: { ...contest.rankList, show: !contest.rankList.show, automaticHide: contest.rankList.automaticHide ? false : contest.rankList.automaticHide } })} />} label="Show Ranklist to Participants" />
                            {contest.rankList.show && <FormControlLabel control={<Switch checked={contest.rankList.automaticHide} onClick={() => setContest({ ...contest, rankList: { ...contest.rankList, automaticHide: !contest.rankList.automaticHide } })} />} label="Automatically Hide Ranklist at specific time" />}
                            {contest.rankList.automaticHide && <><Typography>Automatically Hides at:</Typography>
                            <MuiPickersUtilsProvider utils={DateFnsUtils}>
                                <Grid container justify="space-around">
                                    <KeyboardDatePicker margin="normal" id="dpd3" label="Set Date" format="MM/dd/yyyy" value={contest.rankList.timeOfHide} onChange={changeHT} KeyboardButtonProps={{ 'aria-label': 'change date' }} />
                                    <KeyboardTimePicker margin="normal" id="tp3" label="Set Time" value={contest.rankList.timeOfHide} onChange={changeHT} KeyboardButtonProps={{ 'aria-label': 'change time' }} />
                                </Grid>
                            </MuiPickersUtilsProvider>
                            </>}
                            <br /><br />
                            {id === 'new' && <Button variant="contained" color="secondary" onClick={addC} disabled={contest.name === "" || contest.description === ""}>Add Contest</Button>}
                            {id !== 'new' && <Button variant="contained" onClick={editC} disabled={contest.name === "" || contest.description === ""}>Edit Contest</Button>}
                        </Paper>
                    </Grid>
                    <Grid item md={3} className="force100"></Grid>
                </Grid>
            </div>
        </>
    );
};

export default AddContest;
