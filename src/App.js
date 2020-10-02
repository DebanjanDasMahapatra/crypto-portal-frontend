import React from "react";
import io from "socket.io-client";
import { configs } from "./globals";
import Alert from '@material-ui/lab/Alert';
import { createMuiTheme, ThemeProvider, useMediaQuery, Typography, Snackbar, Backdrop, Button, Dialog, DialogTitle, DialogActions, DialogContent, CircularProgress, makeStyles } from "@material-ui/core";
import "./App.css";
import BaseComponent from "./components/BaseComponent";
import { Route, BrowserRouter as Router } from "react-router-dom";

const customStyles = makeStyles(theme => ({
  backdrop: {
    zIndex: theme.zIndex.appBar + 1,
    color: '#fff',
    position: 'fixed'
  },
}))

const App = () => {
  const classes = customStyles();
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');

  const theme = React.useMemo(
    () =>
      createMuiTheme({
        palette: {
          type: prefersDarkMode ? 'dark' : 'light',
        },
      }),
    [prefersDarkMode],
  );

  const [loading, setLoading] = React.useState(false);
  const [socket, setSocket] = React.useState(null);
  const [tcs, setTCS] = React.useState(null);
  const [error, setError] = React.useState(0);
  const [discussions, setDiscussions] = React.useState({});
  const [announcements, setAnnouncements] = React.useState({});
  const [globalTime, setGlobalTime] = React.useState(new Date().getTime());
  const [snack, setSnack] = React.useState({
    show: false,
    msg: "",
    status: false
  });
  const [confirmer, setConfirmer] = React.useState({
    open: false,
    title: "",
    content: "",
    positiveButtonText: "",
    negativeButtonText: "",
    cb: null
  });
  const [notification, setNotification] = React.useState({
    open: false,
    message: "",
    buttonText: "",
    cb: null
  });

  const createSocket = () => {
    let user = atob(localStorage.getItem('token').split(".")[1]);
    const soc = io(configs.baseUrl + '/loggedin', {
      query: {
        email: JSON.parse(user).email,
        type: configs.isAdmin() ? 'admin' : 'user',
        cids: localStorage.getItem('contestInfo')
      }
    });
    soc.on('connect', () => {
      console.log("Connected to server");
      setLoading(false);
    });
    soc.on('disconnect', () => {
      console.log("Disconnected from server");
    });
    soc.on('new-question-added-info', data => {
      let tit = "", prefix = "";
      if (data.title.length === 1) {
        tit = data.title[0];
        prefix = "A new question";
      }
      else {
        for (let i = 0; i < data.title.length - 2; i++)
          tit += data.title[i] + ", ";
        tit += data.title[data.title.length - 2] + " and " + data.title[data.title.length - 1];
        prefix = "Some new questions";
      }
      setNotification({
        open: true,
        message: `${prefix} ${tit} has been uploaded in the contest ${data.name}. Refresh the page to view the new question(s).`,
        buttonText: "Refresh",
        cb: () => window.location.reload()
      });
    });
    soc.on('contest-edited-info', data => {
      setNotification({
        open: true,
        message: `The contest ${data.name} has been edited. Start Time and/or End Time may have changed. Please Refresh the page.`,
        buttonText: "Refresh",
        cb: () => window.location.reload()
      });
    });
    soc.on('discussion-info', data => {
      setDiscussions((prevDisc) => ({ ...prevDisc, [`${data.cid}`]: [...prevDisc[`${data.cid}`] || [], data.msg] }));
      setNotification({
        open: true,
        message: `There is(are) a(some) new discussion message(s) for contest(${data.cid}).`,
        buttonText: "",
        cb: null
      });
    });
    soc.on('announcement-info', data => {
      setAnnouncements((prevDisc) => ({ ...prevDisc, [`${data.cid}`]: [data.msg, ...prevDisc[`${data.cid}`] || []] }));
      setNotification({
        open: true,
        message: `There is(are) a(some) new announcement for contest (${data.cid}).`,
        buttonText: "",
        cb: null
      });
    });
    if (configs.isUser()) {
      soc.on('allowed-users-info', data => {
        if (data.users.indexOf(configs.getEmail()) !== -1) {
          localStorage.setItem('contestInfo', JSON.stringify([...JSON.parse(localStorage.getItem('contestInfo')), data.cid]));
          soc.emit('join-me', { cid: data.cid });
          setNotification({
            open: true,
            message: `You now have access to the contest ${data.name}. Refresh the page to view the Contest.`,
            buttonText: "Refresh",
            cb: () => window.location.reload()
          });
        }
      });
    }
    if (configs.isAdmin()) {
      soc.on('new-question-added-info2', data => {
        setNotification({
          open: true,
          message: `A new question ${data.title} has been uploaded. Refresh the page to view the new question.`,
          buttonText: "Refresh",
          cb: () => window.location.reload()
        });
      });
      soc.on('new-contest-added-info', data => {
        localStorage.setItem('contestInfo', JSON.stringify([...JSON.parse(localStorage.getItem('contestInfo')), data.cid]));
        soc.emit('join-me', { cid: data.cid });
        setNotification({
          open: true,
          message: `A contest ${data.name} has been added. Refresh the page to view the Contest.`,
          buttonText: "Refresh",
          cb: () => window.location.reload()
        });
      });
      soc.on('question-edited-info', data => {
        setNotification({
          open: true,
          message: `The question ${data.title} has been edited. Please Refresh the page.`,
          buttonText: "Refresh",
          cb: () => window.location.reload()
        });
      });
    }
    setSocket(soc);
  }

  const closeConfirmation = (open) => {
    if (open)
      confirmer.cb();
    setConfirmer({ open: false, title: "", content: "", positiveButtonText: "", negativeButtonText: "", cb: null });
  };

  const openConfirmation = (conf) => { setConfirmer({ open: true, ...conf }); };

  const closeSnack = () => { setSnack({ ...snack, show: false, msg: "" }); };

  React.useEffect(() => {
    const ttccss = io(configs.baseUrl + '/tcs');
    ttccss.on('connect', () => {
      console.clear()
      console.log("TCS Connected to server");
      setError(1);
    });
    ttccss.on('disconnect', () => {
      console.log("TCS Disconnected from server");
      setError(-1);
    });
    ttccss.on('time-info', time => {
      setGlobalTime(new Date(time).getTime());
    });
    ttccss.on('force-reload-execute', () => {
      window.location.reload();
    });
    setTCS(ttccss);

    if (configs.isLoggedIn()) {
      setLoading(true);
      createSocket();
    }
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <Backdrop className={classes.backdrop} open={loading && error === 1}>
        <CircularProgress color="secondary" />
      </Backdrop>
      <Dialog open={confirmer.open} onClose={() => closeConfirmation(false)} aria-labelledby="form-dialog-titlee">
        <DialogTitle id="form-dialog-titlee">{confirmer.title}</DialogTitle>
        <DialogContent style={{ textAlign: ' justify', whiteSpace: 'pre-line', wordWrap: 'break-word' }}>
          <Typography color="textSecondary" dangerouslySetInnerHTML={{ __html: confirmer.content }}></Typography>
        </DialogContent>
        <DialogActions>
          {confirmer.negativeButtonText && <Button onClick={() => closeConfirmation(false)}> {confirmer.negativeButtonText} </Button>}
          <Button onClick={() => closeConfirmation(true)}> {confirmer.positiveButtonText}  </Button>
        </DialogActions>
      </Dialog>
      <Snackbar open={snack.show} autoHideDuration={4000} onClose={closeSnack}>
        <Alert elevation={10} variant="filled" onClose={closeSnack} severity={snack.status ? "success" : "error"}>
          {snack.msg}
        </Alert>
      </Snackbar>
      <Router>
        <Route path={"/"} render={props => (
          <BaseComponent {...props} error={error} announcements={announcements} setAnnouncements={setAnnouncements} discussions={discussions} setDiscussions={setDiscussions} tcs={tcs} notification={notification} setNotification={setNotification} globalTime={globalTime} setLoading={setLoading} setSnack={setSnack} openConfirmation={openConfirmation} socket={socket} createSocket={createSocket} />
        )}></Route>
      </Router>
    </ThemeProvider>
  );
};

export default App;
