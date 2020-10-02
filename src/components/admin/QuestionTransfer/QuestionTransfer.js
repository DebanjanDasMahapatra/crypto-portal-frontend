import React from "react";
import axios from "axios";
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import {makeStyles,IconButton, Container,Divider,Button,Checkbox,Grid,List,Card,CardHeader,ListItem,ListItemText,ListItemIcon} from "@material-ui/core";
import { configs } from "../../../globals";

const useStyles = makeStyles((theme) => ({
    root: {
        margin: 'auto',
    },
    cardHeader: {
        padding: theme.spacing(1, 2),
    },
    list: {
        height: '70vh',
        backgroundColor: theme.palette.background.paper,
        overflow: 'auto',
    },
    button: {
        margin: theme.spacing(0.5, 0),
    },
}));

function not(a, b) {
    return a.filter((value) => b.indexOf(value) === -1);
}

function intersection(a, b) {
    return a.filter((value) => b.indexOf(value) !== -1);
}

function union(a, b) {
    return [...a, ...not(b, a)];
}

const QuestionTransfer = (props) => {

    const { history, setLoading, setSnack, openConfirmation, socket } = props;

    const classes = useStyles();
    const [auth, setAuth] = React.useState(false);
    const [checked, setChecked] = React.useState([]);
    const [id, setId] = React.useState(props.match.params.cid);
    const [left, setLeft] = React.useState([]);
    const [right, setRight] = React.useState([]);
    const [prev, setPrev] = React.useState([]);
    const [ques, setQues] = React.useState([]);

    const leftChecked = intersection(checked, left);
    const rightChecked = intersection(checked, right);

    const saveContestQuestions = () => {
        setLoading(true);
        let finalArr = [];
        ques.forEach(que => {
            if (right.indexOf(que.title) !== -1)
                finalArr.push(que.title);
        });
        let newQuestionTitles = right.filter(r => prev.indexOf(r) === -1);
        axios.post(`${configs.baseUrl}/admin/migrateQuestion/${id}`, { questions: finalArr }).then(
            result => {
                setSnack({ show: true, msg: result.data.message, status: result.data.status });
                if (result.data.status) {
                    fetchData();
                    if (newQuestionTitles.length)
                        socket.emit('new-question-added', { title: newQuestionTitles, name: result.data.message.split(":")[1].trim(), cid: id });
                }
                else {
                    setLoading(false);
                }
            }
        ).catch(
            error => {
                setSnack({ show: true, msg: "Failed to Connect to the Server...", status: false });
                setLoading(false);
            }
        );
    }

    const save = () => {
        openConfirmation({ title: "Confirm", content: `Save Changes?`, positiveButtonText: "YES", negativeButtonText: "NO", cb: saveContestQuestions })
    };

    const fetchData = () => {
        axios.all([axios.get(`${configs.baseUrl}/admin/getAllQuestion`), axios.get(`${configs.baseUrl}/admin/getContestQuestion/${id}`)])
            .then(axios.spread((result1, result2) => {
                if (result1.data.status && result2.data.status) {
                    setQues(result1.data.data);
                    let rightArr = [];
                    result2.data.data.forEach(qs => rightArr.push(qs.title));
                    setRight(rightArr);
                    setPrev(rightArr);
                    let leftArr = [];
                    result1.data.data.filter(q => rightArr.indexOf(q.title) === -1).forEach(qs => leftArr.push(qs.title));
                    setLeft(leftArr);
                    setSnack({ show: true, msg: "Succesfully Retrieved Questions and Contest", status: true });
                }
                else {
                    setSnack({ show: true, msg: result2.data.message, status: false });
                    if(result1.status === 401 || result2.status === 401)
                        configs.logout(socket);
                }
                setLoading(false);
            })).catch(
                error => {
                    setSnack({ show: true, msg: "Failed to Connect to the Server...", status: false });
                    setLoading(false);
                }
            );
    }

    const handleToggle = (value) => () => {
        const currentIndex = checked.indexOf(value);
        const newChecked = [...checked];

        if (currentIndex === -1) {
            newChecked.push(value);
        } else {
            newChecked.splice(currentIndex, 1);
        }

        setChecked(newChecked);
    };

    const numberOfChecked = (items) => intersection(checked, items).length;

    const handleToggleAll = (items) => () => {
        if (numberOfChecked(items) === items.length) {
            setChecked(not(checked, items));
        } else {
            setChecked(union(checked, items));
        }
    };

    const handleCheckedRight = () => {
        setRight(right.concat(leftChecked));
        setLeft(not(left, leftChecked));
        setChecked(not(checked, leftChecked));
    };

    const handleCheckedLeft = () => {
        setLeft(left.concat(rightChecked));
        setRight(not(right, rightChecked));
        setChecked(not(checked, rightChecked));
    };

    React.useEffect(() => {
        if (!configs.isAdmin()) {
            setAuth(false);
            history.push('/');
        } else
        {
            setAuth(true);
            document.title="CryptoQuest|Question Transfer";
        }
    },[configs.isAdmin()]);

    React.useEffect(() => {
        if(!auth)   return;
        setLoading(true);
        setId(props.match.params.cid)
        fetchData();
    }, [props.match.params.cid,auth]);

    const customList = (title, items) => (
        <Card>
            <CardHeader
                className={classes.cardHeader}
                avatar={
                    <Checkbox
                        onClick={handleToggleAll(items)}
                        checked={numberOfChecked(items) === items.length && items.length !== 0}
                        indeterminate={numberOfChecked(items) !== items.length && numberOfChecked(items) !== 0}
                        disabled={items.length === 0}
                        inputProps={{ 'aria-label': 'all items selected' }}
                    />
                }
                title={title}
                subheader={`${numberOfChecked(items)}/${items.length} selected`}
            />
            <Divider />
            <List className={classes.list} dense component="div" role="list">
                {items.map((value) => {
                    const labelId = `transfer-list-all-item-${value}-label`;

                    return (
                        <ListItem key={value} role="listitem" button onClick={handleToggle(value)}>
                            <ListItemIcon>
                                <Checkbox
                                    checked={checked.indexOf(value) !== -1}
                                    tabIndex={-1}
                                    disableRipple
                                    inputProps={{ 'aria-labelledby': labelId }}
                                />
                            </ListItemIcon>
                            <ListItemText id={labelId} primary={value} />
                        </ListItem>
                    );
                })}
                <ListItem />
            </List>
        </Card>
    );

    return (
        <Container fixed style={{opacity: 0.9}}>
            <Grid container spacing={2} justify="center" alignItems="center" className={classes.root}>
                <Grid item md={5}>{customList('Questions in the Store', left)}</Grid>
                <Grid item md={2}>
                    <Grid container direction="column" alignItems="center">
                        <IconButton
                            className={classes.button}
                            onClick={handleCheckedRight}
                            disabled={leftChecked.length === 0}
                            aria-label="move selected right"
                        >
                            <ChevronRightIcon />
                        </IconButton>
                        <IconButton
                            className={classes.button}
                            onClick={handleCheckedLeft}
                            disabled={rightChecked.length === 0}
                            aria-label="move selected left"
                        >
                            <ChevronLeftIcon />
                        </IconButton>
                    </Grid>
                </Grid>
                <Grid item md={5}>{customList('Questions already present', right)}</Grid>
            </Grid>
            <div style={{ textAlign: 'center' }}>
                <Button onClick={save} color="secondary" variant="contained">Save</Button>
            </div>
            <br />
        </Container>
    );
};

export default QuestionTransfer;
