import React from 'react';
import axios from "axios";
import { configs } from "../../../globals";
import { makeStyles } from '@material-ui/core/styles';
import { Container, Paper, Grid, Typography, Card, CardContent, TableCell, TableRow, TableContainer, Table, TableBody, withStyles } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
    root: {
        width: '100%',
        padding: '1%'
    },
    cent: {
        textAlign: 'center'
    },
    label: {
        color: theme.palette.text.secondary
    },
}));

const StyledTableCell = withStyles((theme) => ({
    body: {
        fontSize: 14,
    },
}))(TableCell);

const Profile = (props) => {
    const { history, setLoading, setSnack, socket } = props;
    const dateTimeFormat = new Intl.DateTimeFormat('en', { weekday: 'long', year: 'numeric', month: 'long', day: '2-digit', hour: 'numeric', minute: 'numeric', second: 'numeric' });
    const classes = useStyles();
    const [auth, setAuth] = React.useState(false);
    const [contestInfo, setContestInfo] = React.useState([]);
    const [userInfo, setUserInfo] = React.useState({});

    const fetchProfile = () => {
        axios.get(`${configs.baseUrl}/common/getPoints`)
            .then(({status, data}) => {
                if (data.status) {
                    setUserInfo(JSON.parse(atob(localStorage.getItem('token').split(".")[1])));
                    let cInfo = [];
                    JSON.parse(localStorage.getItem('contestInfo')).forEach(cn => cInfo.push({
                        name: cn,
                        points: data.data.find(cp => cp._id === cn)?.totalPoints || 0
                    }));
                    setContestInfo(cInfo);
                    setSnack({ show: true, msg: "Profile Information Retrieved :)", status: true });
                }
                else {
                    setSnack({ show: true, msg: data.message, status: false });
                    if (status === 401)
                        configs.logout(socket);
                }
                setLoading(false);
            }).catch(
                error => {
                    setSnack({ show: true, msg: "Failed to Connect to the Server...", status: false });
                    setLoading(false);
                }
            )
    }

    React.useEffect(() => {
        if (!auth) return;
        else {
            setLoading(true);
            fetchProfile();
        }
    }, [auth]);

    React.useEffect(() => {
        if (!configs.isUser()) {
            setAuth(false);
            history.push('/');
        } else {
            setAuth(true);
            document.title = "CryptoQuest|Profile"
        }
    }, [configs.isUser()]);

    return (
        <Container fixed style={{opacity: 0.9}}>
            <br />
            <Grid container spacing={10}>
                <Grid item md={6}>
                    <Typography variant="h4" color="primary" className={classes.cent}>My Profile</Typography>
                    <br />
                    <TableContainer component={Paper} elevation={10}>
                        <Table aria-label="customized table">
                            <TableBody>
                                {userInfo.name && <TableRow>
                                    <StyledTableCell className={classes.label}>Name:</StyledTableCell>
                                    <StyledTableCell>{userInfo.name}</StyledTableCell>
                                </TableRow>}
                                {userInfo.email && <TableRow>
                                    <StyledTableCell className={classes.label}>Email ID:</StyledTableCell>
                                    <StyledTableCell>{userInfo.email}</StyledTableCell>
                                </TableRow>}
                                {userInfo.contact && <TableRow>
                                    <StyledTableCell className={classes.label}>Contact:</StyledTableCell>
                                    <StyledTableCell>{userInfo.contact}</StyledTableCell>
                                </TableRow>}
                                {userInfo.rcid && <TableRow>
                                    <StyledTableCell className={classes.label}>RC ID:</StyledTableCell>
                                    <StyledTableCell>{userInfo.rcid}</StyledTableCell>
                                </TableRow>}
                                {userInfo.hasOwnProperty('stream') && <TableRow>
                                    <StyledTableCell className={classes.label}>Stream:</StyledTableCell>
                                    <StyledTableCell>{userInfo.stream ? userInfo.stream : '- - -'}</StyledTableCell>
                                </TableRow>}
                                {userInfo.hasOwnProperty('year') && <TableRow>
                                    <StyledTableCell className={classes.label}>Year:</StyledTableCell>
                                    <StyledTableCell>{userInfo.year ? userInfo.year : '- - -'}</StyledTableCell>
                                </TableRow>}
                                {userInfo.hasOwnProperty('instituteName') && <TableRow>
                                    <StyledTableCell className={classes.label}>College:</StyledTableCell>
                                    <StyledTableCell>{userInfo.instituteName ? userInfo.instituteName : '- - -'}</StyledTableCell>
                                </TableRow>}
                                {userInfo.createdAt && <TableRow>
                                    <StyledTableCell className={classes.label}>Registration Time:</StyledTableCell>
                                    <StyledTableCell>{dateTimeFormat.format(new Date(userInfo.createdAt))}</StyledTableCell>
                                </TableRow>}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Grid>
                <Grid item md={6}>
                    <Typography variant="h4" color="secondary" className={classes.cent}>Registered Contests</Typography>
                    <br />
                    <Grid container spacing={5}>
                        {
                            contestInfo.map(c => <React.Fragment key={c.name}>
                                <Grid item sm={6} className={classes.cent}>
                                    <Paper elevation={10}>
                                        <Card>
                                            <CardContent>
                                                <Typography color="textSecondary"> {c.name} </Typography>
                                                <br />
                                                <Typography variant="h4">{c.points}</Typography>
                                            </CardContent>
                                        </Card>
                                    </Paper>
                                </Grid>
                                <br />
                            </React.Fragment>)
                        }
                    </Grid>
                </Grid>
            </Grid>
        </Container>
    );
}

export default Profile;