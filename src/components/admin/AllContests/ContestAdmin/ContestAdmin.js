import React from "react";
import axios from "axios";
import { configs } from "../../../../globals";
import CreateIcon from '@material-ui/icons/Create';
import DeleteIcon from '@material-ui/icons/Delete';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import VisibilityIcon from '@material-ui/icons/Visibility';
import VisibilityOffIcon from '@material-ui/icons/VisibilityOff';
import { Popper, Paper, ClickAwayListener, MenuList, MenuItem, Grow, Dialog, DialogTitle, DialogContent, DialogActions, Button } from "@material-ui/core";
import { makeStyles, Card, CardHeader, CardMedia, CardContent, Typography, CssBaseline, IconButton, CardActions } from "@material-ui/core";

import Alert from '@material-ui/lab/Alert';


const useStyles = makeStyles((theme) => ({
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
    expandOpen: {
        transform: 'rotate(180deg)',
    },
}));

const ContestAdmin = (props) => {

    const { contest, history, setLoading, setSnack, fetchContests, openConfirmation } = props;
    const classes = useStyles();
    const [open, setOpen] = React.useState(false);
    const [open2, setOpen2] = React.useState(false);
    const anchorRef = React.useRef(null);
    const dateTimeFormat = new Intl.DateTimeFormat('en', { weekday: 'long', year: 'numeric', month: 'long', day: '2-digit', hour: 'numeric', minute: 'numeric', second: 'numeric' });

    const handleToggle = () => {
        setOpen((prevOpen) => !prevOpen);
    };

    const handleOpen2 = () => setOpen2(true);

    const handleClose2 = () => setOpen2(false);

    const handleClose = (event) => {
        if (anchorRef.current && anchorRef.current.contains(event.target)) {
            return;
        }
        setOpen(false);
    };

    function handleListKeyDown(event) {
        if (event.key === 'Tab') {
            event.preventDefault();
            setOpen(false);
        }
    }

    //Doubt
    const prevOpen = React.useRef(open);
    React.useEffect(() => {
        if (prevOpen.current === true && open === false) {
            anchorRef.current.focus();
        }
        prevOpen.current = open;
    }, [open]);

    const toggleRanklist = () => {
        setLoading(true);
        axios.get(`${configs.baseUrl}/admin/toggleRankList/${contest._id}`).then(
            result => {
                setSnack({ show: true, msg: result.data.message, status: result.data.status });
                if(result.data.status)
                {
                    fetchContests();
                }
                else
                {
                    setLoading(false);
                }
            }
        ).catch(
            error => {
                setSnack({ show: true, msg: "Failed to Connect to the Server...", status: false });
                setLoading(false);
            }
        )
    };

    const togL = () => {
        openConfirmation({title: "Confirm", content: `Sure to ${contest.rankList.show ? "Hide" : "Show"} the Leaderboard of the Contest ${contest.name}?`, positiveButtonText: "YES", negativeButtonText: "NO", cb: toggleRanklist})
    };

    const editContest = () => {
        history.push('/contest/' + contest.name);
    }

    const transferQuestions = () => {
        history.push('/transfer/' + contest.name);
    }

    const addQuestion = () => {
        history.push(`/question/${contest.name}/new`);
    }

    const viewQuestions = () => {
        history.push(`/allquestions/${contest.name}`);
    }

    const manageUsers = () => {
        history.push(`/manageusers/${contest.name}`);
    }

    const rankList = () => {
        history.push(`/userranklist/${contest.name}`)
    }

    const discussions = () => {
        history.push(`/discussions/${contest.name}`)
    }

    const announcements = () => {
        history.push(`/announcements/${contest.name}`)
    }

    const deleteContest = () => {
        setLoading(true);
        axios.delete(`${configs.baseUrl}/admin/deleteContest/${contest.name}`).then(
            result => {
                setSnack({ show: true, msg: result.data.message, status: result.data.status });
                if(result.data.status)
                {
                    fetchContests();
                }
                else
                {
                    setLoading(false);
                }
            }
        ).catch(
            error => {
                setSnack({ show: true, msg: "Failed to Connect to the Server...", status: false });
                setLoading(false);
            }
        )
    }

    const delC = () => {
        openConfirmation({title: "Confirm", content: `Sure to Delete the Contest ${contest.name}?`, positiveButtonText: "YES", negativeButtonText: "NO", cb: deleteContest})
    };

    return (
        <>
            <Card>
                <CardHeader
                    title={contest.name}
                    action={
                        <IconButton ref={anchorRef} aria-controls={open ? 'menu-list-grow' : undefined}
                            aria-haspopup="true" onClick={handleToggle} title="Menu">
                            <MoreVertIcon />
                        </IconButton>
                    }
                />
                <CssBaseline />
                {contest.imageUrl && <CardMedia className={classes.media} image={contest.imageUrl} title="Logo" />}
                <Popper open={open} anchorEl={anchorRef.current} role={undefined} transition disablePortal>
                    {({ TransitionProps, placement }) => (
                        <Grow {...TransitionProps} style={{ transformOrigin: placement === 'bottom' ? 'center top' : 'center bottom' }}>
                            <Paper>
                                <ClickAwayListener onClickAway={handleClose}>
                                    <MenuList id="menu-list-grow" onKeyDown={handleListKeyDown}>
                                        <MenuItem onClick={viewQuestions}>View Questions</MenuItem>
                                        <MenuItem onClick={addQuestion}>Add Question</MenuItem>
                                        <MenuItem onClick={transferQuestions}>Transfer Questions</MenuItem>
                                        <MenuItem onClick={manageUsers}> Allowed Users </MenuItem>
                                        <MenuItem onClick={rankList}>Ranklist</MenuItem>
                                        <MenuItem onClick={discussions}>Discussions</MenuItem>
                                        <MenuItem onClick={announcements}>Announcements</MenuItem>
                                    </MenuList>
                                </ClickAwayListener>
                            </Paper>
                        </Grow>
                    )}
                </Popper>
                <CardContent>
                    <Typography paragraph style={{ textAlign: 'justify', wordBreak: 'break-word' }}>{contest.description}</Typography>
                    <Alert variant="outlined" severity="info">{contest.allowedUsers.length} user(s) are allowed, {contest.questions.length} questions(s) are linked</Alert>
                </CardContent>
                <CardContent style={{ textAlign: 'center'}}>
                    <Typography paragraph color="textSecondary" style={{ marginBottom: 'auto' }}><b>From: </b></Typography>
                    <Typography paragraph style={{ wordBreak: 'break-word' }}>{dateTimeFormat.format(new Date(contest.startTime))}</Typography>
                    <Typography paragraph color="textSecondary" style={{ marginBottom: 'auto' }}><b>To: </b></Typography>
                    <Typography paragraph style={{ wordBreak: 'break-word' }}>{dateTimeFormat.format(new Date(contest.endTime))} </Typography>
                    <Button variant="contained" onClick={handleOpen2}>Rules</Button>
                </CardContent>
                <CardContent>
                    <Alert variant="outlined" severity={contest.rankList.show ? "success" : "warning"}>Ranklist is {contest.rankList.show ? "" : "in"}visible</Alert>
                    {!contest.rankList.automaticHide && <Alert variant="outlined" severity="warning">Auto Hide Ranklist is OFF</Alert>}
                    {contest.rankList.automaticHide && <Alert variant="outlined" severity="success"><b>Ranklist will automatically hide at: </b><br />{dateTimeFormat.format(new Date(contest.rankList.timeOfHide))}</Alert>}
                </CardContent>
                <CardActions disableSpacing>
                    <IconButton onClick={editContest} title="Edit"> <CreateIcon /> </IconButton>
                    <IconButton onClick={delC} title="Delete"> <DeleteIcon /> </IconButton>
                    {(!contest.rankList.automaticHide || (contest.rankList.automaticHide && new Date(contest.rankList.timeOfHide) > new Date())) && <IconButton className={classes.expand} onClick={togL} title="Toggle Ranklist">{contest.rankList.show ? <VisibilityOffIcon /> : <VisibilityIcon />}</IconButton>}
                </CardActions>
            </Card>
            <Dialog open={open2} onClose={handleClose2} maxWidth="md" aria-labelledby="form-dialog-title">
                <DialogTitle id="form-dialog-title">Rules</DialogTitle>
                <DialogContent>
                    <span dangerouslySetInnerHTML={{__html: contest.rules.replace(/\n/g,"<br />")}}></span>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose2}> Close </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default ContestAdmin;
