import React from "react";
import { makeStyles, Card, CardHeader, CardMedia, CardContent, Typography, CssBaseline, Button, CardActions, Dialog, DialogTitle, DialogContent, DialogActions } from "@material-ui/core";
import Alert from "@material-ui/lab/Alert";

const useStyles = makeStyles((theme) => ({
    media: {
        height: 0,
        paddingTop: '56.25%', // 16:9
    },
    expand: {
        marginLeft: 'auto'
    }
}));

const ContestUser = (props) => {
    const { history, contest } = props;
    const classes = useStyles();
    const [open, setOpen] = React.useState(false);
    const dateTimeFormat = new Intl.DateTimeFormat('en', { weekday: 'long', year: 'numeric', month: 'long', day: '2-digit', hour: 'numeric', minute: 'numeric', second: 'numeric' });

    const handleOpen = () => setOpen(true);

    const handleClose = () => setOpen(false);

    const viewQuestions = () => history.push(`/questions/${contest.name}`);

    const viewRanklist = () => history.push(`/ranklist/${contest.name}`);

    const viewDiscussion = () => history.push(`/discussion/${contest.name}`);

    const viewAnnouncement = () => history.push(`/announcement/${contest.name}`);

    return (
        <>
            <Card>
                <CardHeader style={{ textAlign: 'center' }} title={contest.name} />
                <CssBaseline />
                {contest.imageUrl && <CardMedia className={classes.media} image={contest.imageUrl} title="Logo" />}
                <CardContent>
                    <Typography color="textSecondary" paragraph style={{ textAlign: 'justify', wordBreak: 'break-word' }}>{contest.description}</Typography>
                </CardContent>
                <CardContent style={{ textAlign: 'center' }}>
                    <Typography paragraph color="textSecondary" style={{ marginBottom: 'auto' }}><b>From: </b></Typography>
                    <Typography paragraph style={{ wordBreak: 'break-word' }}>{dateTimeFormat.format(new Date(contest.startTime))}</Typography>
                    <Typography paragraph color="textSecondary" style={{ marginBottom: 'auto' }}><b>To: </b></Typography>
                    <Typography paragraph style={{ wordBreak: 'break-word' }}>{dateTimeFormat.format(new Date(contest.endTime))} </Typography>
                    <Button variant="contained" onClick={handleOpen}>Rules</Button>
                    <br /><br />
                    <Alert variant="filled" severity={contest.status.phase === 3 ? "error" : (contest.status.phase === 2 ? "success" : "info")} style={{ marginBottom: 'auto' }}>{contest.status.msg}</Alert>
                </CardContent>
                <CardActions disableSpacing>
                    <Button color="secondary" variant="contained" onClick={viewQuestions} disabled={!contest.status.isFlag}>Solve Questions</Button>
                    <Button className={classes.expand} color="secondary" variant="contained" onClick={viewRanklist} disabled={!contest.status.isRanklist}>View Leaderboard</Button>
                </CardActions>
                <CardActions disableSpacing>
                    <div style={{ margin: '0 auto' }}>
                        <Button color="primary" variant="contained" onClick={viewDiscussion} disabled={!contest.status.isFlag}>Have Queries? Join Discussion</Button>
                    </div>
                </CardActions>
                <CardActions disableSpacing>
                    <div style={{ margin: '0 auto' }}>
                        <Button color="primary" variant="contained" onClick={viewAnnouncement} disabled={!contest.status.isFlag}>See Announcements</Button>
                    </div>
                </CardActions>
                <br />
            </Card>
            <Dialog open={open} onClose={handleClose} maxWidth="md" aria-labelledby="form-dialog-title">
                <DialogTitle id="form-dialog-title">Rules</DialogTitle>
                <DialogContent>
                    <span dangerouslySetInnerHTML={{ __html: contest.rules.replace(/\n/g, "<br />") }}></span>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}> Close </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default ContestUser;
