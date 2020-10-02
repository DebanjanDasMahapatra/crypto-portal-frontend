import React from 'react';
import clsx from 'clsx';
import axios from "axios";
import { configs } from "../globals";
import AddIcon from '@material-ui/icons/Add';
import HomeIcon from '@material-ui/icons/Home';
import AssignmentIcon from '@material-ui/icons/Assignment';
import MenuIcon from '@material-ui/icons/Menu';
import DvrIcon from '@material-ui/icons/Dvr';
import HowToRegIcon from '@material-ui/icons/HowToReg';
import PeopleAltIcon from '@material-ui/icons/PeopleAlt';
import PersonIcon from '@material-ui/icons/Person';
import RefreshIcon from '@material-ui/icons/Refresh';
import SettingsIcon from '@material-ui/icons/Settings';
import { ListItemIcon, ListItemText, Typography, Toolbar, CssBaseline, AppBar, Drawer, Divider, List, IconButton, makeStyles } from "@material-ui/core";
import { Button, Dialog, DialogTitle, TextField, DialogActions, DialogContent, ListItem, Tooltip, withStyles } from "@material-ui/core";
import "../App.css";
import AddQuestion from "./admin/AddQuestion/AddQuestion";
import { Route, Switch } from "react-router-dom";
import ViewQuestion from "./user/ViewQuestion/ViewQuestion";
import Home from "./common/Home/Home";
import Ranking from "./user/Ranking/Ranking";
import AddContest from "./admin/AddContest/AddContest";
import Contests from "./user/Contests/Contests";
import AllContests from "./admin/AllContests/AllContests";
import AllQuestions from "./admin/AllQuestions/AllQuestions";
import QuestionTransfer from "./admin/QuestionTransfer/QuestionTransfer";
import ErrorPage from "./common/ErrorPage/ErrorPage";
import UserManagement from "./admin/UserManagement/UserManagement";
import Register from "./common/Register/Register";
import UserDetails from "./admin/UserDetails/UserDetails";
import AdminRanking from './admin/RankingAdmin/RankingAdmin';
import ClockAndConnection from './common/ClockAndConnection/ClockAndConnection';
import Discussions from './admin/Discussions/Discussions';
import Discussion from './user/Discussion/Discussion';
import Announcements from './admin/Announcements/Announcements';
import Announcement from './user/Announcement/Announcement';
import Profile from './user/Profile/Profile';
import ServerControl from './admin/ServerControl/ServerControl';

const drawerWidth = 240;

const customStyles = makeStyles((theme) => ({
    root: {
        display: 'flex',
    },
    menuButton: {
        marginRight: theme.spacing(2),
    },
    hide: {
        display: 'none',
    },
    drawer: {
        width: drawerWidth,
        flexShrink: 0
    },
    drawerPaper: {
        width: drawerWidth,
        opacity: 0.9
    },
    title: {
        flexGrow: 1,
    },
    drawerContainer: {
        overflow: 'auto',
    },
    dangerLink: {
        background: 'red',
        color: 'white'
    },
    content: {
        flexGrow: 1,
        padding: theme.spacing(3),
        transition: theme.transitions.create('margin', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
        }),
        marginLeft: -drawerWidth,
    },
    contentShift: {
        transition: theme.transitions.create('margin', {
            easing: theme.transitions.easing.easeOut,
            duration: theme.transitions.duration.enteringScreen,
        }),
        marginLeft: 0,
    },
    appBar: {
        zIndex: theme.zIndex.drawer + 5,
        position: 'fixed'
    },
    backdrop: {
        zIndex: theme.zIndex.appBar + 1,
        color: '#fff',
        position: 'fixed'
    },
}));

const BaseComponent = (props) => {

    const { history, tcs, setLoading, setSnack, socket, createSocket } = props;
    const classes = customStyles();
    const [open, setOpen] = React.useState(false);
    const [email, setEmail] = React.useState("");
    const [openD, setOpenD] = React.useState(false);
    const [pswd, setPswd] = React.useState("");

    const submit = () => {
        setLoading(true);
        axios.post(`${configs.baseUrl}/user/login`, {
            email: email,
            password: pswd
        }).then(result => {
            if (result.data.status) {
                localStorage.setItem('token', result.data.token);
                axios.get(`${configs.baseUrl}/${configs.isAdmin() ? 'admin' : 'common'}/getAllowedContestName`).then(result2 => {
                    if (result2.data.status) {
                        let ids = [];
                        result2.data.data.forEach(d => ids.push(d.name));
                        localStorage.setItem('contestInfo', JSON.stringify(ids));
                        setSnack({ show: true, msg: "Logged in Successfully", status: true });
                        createSocket();
                    }
                    else {
                        setSnack({ show: true, msg: result2.data.message, status: false });
                        setLoading(false);
                    }
                }).catch(error => {
                    setSnack({ show: true, msg: "Failed to Connect to the Server...", status: false });
                    setLoading(false);
                });
            }
            else {
                setSnack({ show: true, msg: result.data.message, status: false });
                setLoading(false);
            }
        }).catch(error => {
            setSnack({ show: true, msg: "Failed to Connect to the Server...", status: false });
            setLoading(false);
        });
    };

    const logout = () => {
        setLoading(true);
        socket.disconnect();
        setTimeout(() => { }, 1500);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        localStorage.removeItem('contestInfo');
        setTimeout(() => {
            setLoading(false);
        }, 1500);
    };

    const toggleDrawer = () => setOpen(!open);

    const handleClose = (login) => {
        setOpenD(false);
        if (login)
            submit();
    };

    const handleClickOpen = () => setOpenD(true);

    const forceReload = () => tcs.emit('force-reload-init');

    const routing = (path) => history.push(path);

    React.useEffect(() => {
        if (history.location.pathname === '/') {
            document.title = "CryptoQuest";
        }
    })

    const HtmlTooltip = withStyles((theme) => ({
        tooltip: {
            backgroundColor: theme.palette.background.default,
            color: theme.palette.text.primary,
            maxWidth: 220,
            fontSize: theme.typography.pxToRem(12),
            border: '1px solid #dadde9',
        },
    }))(Tooltip);

    return (
        <><Route exact path={"*"}><div className={classes.root}>
            <CssBaseline />
            <AppBar position="absolute" className={clsx(classes.appBar)} >
                <Toolbar>
                    <IconButton color="inherit" aria-label="open drawer" onClick={toggleDrawer} edge="start" className={clsx(classes.menuButton)}> <MenuIcon /> </IconButton>
                    <Typography variant="h6" noWrap className={classes.title}>{configs.isLoggedIn() ? configs.getEmail() : "CryptoQuest"}</Typography>
                    {!configs.isLoggedIn() && <Button variant="outlined" color="inherit" onClick={handleClickOpen}>Login</Button>}
                    {configs.isLoggedIn() && <Button variant="outlined" color="inherit" onClick={logout}>Logout</Button>}
                </Toolbar>
            </AppBar>
            <Drawer className={classes.drawer} variant="persistent" open={open} classes={{ paper: classes.drawerPaper, }} >
                <div className={classes.drawerContainer}>
                    <Toolbar />
                    <Divider />
                    <List>
                        <ListItem button onClick={() => routing('/')}><ListItemIcon><HomeIcon /></ListItemIcon><ListItemText>Home</ListItemText></ListItem>
                        {!configs.isLoggedIn() && <ListItem button onClick={() => routing('/register')}><ListItemIcon><HowToRegIcon /></ListItemIcon><ListItemText>Register</ListItemText></ListItem>}
                        {configs.isUser() && <>
                        <ListItem button onClick={() => routing('/contests')}><ListItemIcon><DvrIcon /></ListItemIcon><ListItemText>Contests</ListItemText></ListItem>
                        <ListItem button onClick={() => routing('/profile')}><ListItemIcon><PersonIcon /></ListItemIcon><ListItemText>Profile</ListItemText></ListItem>
                        </>}
                    </List>
                    {configs.isAdmin() && <>
                        <Divider />
                        <List>
                            <ListItem button onClick={() => routing('/contest/new')}><ListItemIcon><AddIcon /></ListItemIcon><ListItemText>Create Contest</ListItemText></ListItem>
                            <ListItem button onClick={() => routing('/allcontests')}><ListItemIcon><DvrIcon /></ListItemIcon><ListItemText>All Contests</ListItemText></ListItem>
                        </List>
                        <Divider />
                        <List>
                            <ListItem button onClick={() => routing('/question/notselected/new')}><ListItemIcon><AddIcon /></ListItemIcon><ListItemText>Add Question</ListItemText></ListItem>
                            <ListItem button onClick={() => routing('/allquestions/all')}><ListItemIcon><AssignmentIcon /></ListItemIcon><ListItemText>All Questions</ListItemText></ListItem>
                        </List>
                        <Divider />
                        <List>
                            <ListItem button onClick={() => routing('/userlist')}><ListItemIcon><PeopleAltIcon /></ListItemIcon><ListItemText>All User Details</ListItemText></ListItem>
                        </List>
                        <Divider />
                        <List>
                            <ListItem button onClick={() => routing('/servercontrol')}><ListItemIcon><SettingsIcon /></ListItemIcon><ListItemText>Server Control</ListItemText></ListItem>
                        </List>
                        <Divider />
                        <List>
                            <HtmlTooltip
                                title={
                                    <React.Fragment>
                                        <Typography color="inherit">Danger !!!</Typography>
                                        <em>{"Clicking this will"}</em> <span style={{ color: 'red' }}><b>{'RELOAD ALL BROWSER WINDOWS'}</b></span> <em>{'currently open for this portal.'}.</em>
                                    </React.Fragment>
                                }
                            ><ListItem button onClick={forceReload} className={classes.dangerLink}><ListItemIcon><RefreshIcon /></ListItemIcon><ListItemText>Refresh ALL</ListItemText></ListItem>
                            </HtmlTooltip>
                        </List>
                    </>
                    }
                </div>
            </Drawer>
            <main className={clsx(classes.content, { [classes.contentShift]: open, })} >
                <Toolbar />
                <ClockAndConnection {...props} />
                <Switch>
                    <Route exact path={"/"} render={propss => <Home {...props} {...propss} />} />
                    <Route exact path={"/register"} render={propss => <Register {...props} {...propss} />} />

                    <Route exact path={"/contests"} render={propss => <Contests {...props} {...propss} />} />
                    <Route exact path={"/questions/:cid"} render={propss => <ViewQuestion {...props} {...propss} />} />
                    <Route exact path={"/ranklist/:cid"} render={propss => <Ranking {...props} {...propss} />} />
                    <Route exact path={"/discussion/:cid"} render={propss => <Discussion {...props} {...propss} />} />
                    <Route exact path={"/announcement/:cid"} render={propss => <Announcement {...props} {...propss} />} />
                    <Route exact path={"/profile"} render={propss => <Profile {...props} {...propss} />} />

                    <Route exact path={"/contest/:cid"} render={propss => <AddContest {...props}  {...propss} />} />
                    <Route exact path={"/question/:cid/:qid"} render={propss => <AddQuestion {...props}  {...propss} />} />
                    <Route exact path={"/allcontests"} render={propss => <AllContests {...props}  {...propss} />} />
                    <Route exact path={"/allquestions/:cid"} render={propss => <AllQuestions {...props} {...propss} />} />
                    <Route exact path={"/transfer/:cid"} render={propss => <QuestionTransfer {...props}  {...propss} />} />
                    <Route exact path={"/manageusers/:cid"} render={propss => <UserManagement {...props}  {...propss} />} />
                    <Route exact path={"/userlist"} render={propss => <UserDetails {...props}  {...propss} />} />
                    <Route exact path={"/servercontrol"} render={propss => <ServerControl {...props}  {...propss} />} />
                    <Route exact path={"/userranklist/:cid"} render={propss => <AdminRanking {...props} {...propss} />} />
                    <Route exact path={"/discussions/:cid"} render={propss => <Discussions {...props} {...propss} />} />
                    <Route exact path={"/announcements/:cid"} render={propss => <Announcements {...props} {...propss} />} />

                    <Route exact path={"*"} render={propss => <ErrorPage {...props} {...propss} />} />
                </Switch>
            </main>
        </div>
            <Dialog open={openD} onClose={() => handleClose(false)} aria-labelledby="form-dialog-title">
                <DialogTitle id="form-dialog-title">LOGIN</DialogTitle>
                <DialogContent>
                    <TextField variant="outlined" margin="dense" id="l1" label="Email ID" type="text" fullWidth onInput={$e => setEmail($e.target.value)} />
                    <TextField variant="outlined" margin="dense" id="l2" label="Enter Password" type="password" fullWidth onInput={$e => setPswd($e.target.value)} />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => handleClose(false)}> Cancel </Button>
                    <Button onClick={() => handleClose(true)} disabled={email === "" || pswd === ""}> Login  </Button>
                </DialogActions>
            </Dialog>
        </Route>
        </>);
}

export default BaseComponent;