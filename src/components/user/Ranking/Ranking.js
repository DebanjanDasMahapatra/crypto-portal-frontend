import React from "react";
import axios from "axios";
import { configs } from "../../../globals";
import {Typography,withStyles, makeStyles, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper} from '@material-ui/core';

const StyledTableCell = withStyles((theme) => ({
  head: {
    backgroundColor: theme.palette.common.black,
    color: theme.palette.common.white,
  },
  body: {
    fontSize: 14,
  },
}))(TableCell);

const StyledTableRow = withStyles((theme) => ({
  root: {
    '&:nth-of-type(odd)': {
      backgroundColor: theme.palette.action.hover,
    },
  },
}))(TableRow);

const useStyles = makeStyles({
  table: {
    minWidth: 700,
  },
});

const Ranking = (props) => {

    const { history,globalTime, setLoading, setSnack,socket } = props;
    const classes = useStyles();
    const [auth, setAuth] = React.useState(false);
    const [fetched, setFetched] = React.useState(0);
    const [ranklist, setRanklist] = React.useState([]);
    const [id, setId] = React.useState(props.match.params.cid);
    const [contestInfo,setContestInfo] = React.useState(null);

    const fetchSolutions = () => {
        setRanklist([]);
        setFetched(0);
        axios.get(`${configs.baseUrl}/common/getSolutions/${id}`).then(
            result => {
                if (result.data.status) {
                    let solutions = result.data.data;
                    var userPoints = [];
                    let users = [];
                    solutions.forEach(sol => {
                        var userI = users.indexOf(sol.userEmail);
                        if (userI === -1) {
                            users = [...users, sol.userEmail];
                            var newUserPoint = {
                                'email': sol.userEmail,
                                'points': sol.points,
                                'createdAt': sol.createdAt
                            }
                            userPoints.push(newUserPoint);
                        }
                        else {
                            userPoints[userI].points += sol.points;
                            userPoints[userI].createdAt = sol.createdAt;
                        }
                    });
                    //Sort in terms of points
                    if(userPoints.length >0)
                    {
                        userPoints.sort(function (a, b) {
                            // return ((a.points < b.points) ? 1 : -1);
                            if (a.points < b.points)
                                return 1;
                            else if (a.points === b.points && a.createdAt > b.createdAt)
                                return 1;
                            else
                                return -1;
                        });
                    }
                    setRanklist(userPoints.length === 0 ? [null] : userPoints);
                    setFetched(1);
                    var contest=result.data.contest;
                    contest.status=configs.flagRank(contest,globalTime);
                    setContestInfo(contest);
                    setSnack({ show: true, msg: result.data.message, status: result.data.status });
                }
                else
                {
                    setSnack({ show: true, msg: result.data.message, status: result.data.status });
                    if(result.status === 401)
                        configs.logout(socket);
                    if(result.data.data)
                        setFetched(-1);
                    setLoading(false);
                }
            }
        ).catch(
            error => {
                setSnack({ show: true, msg: "Failed to Connect to the Server...", status: false })
                setLoading(false);
            }
        );
    }

    React.useEffect(() => {
        if (!configs.isUser()) {
            setAuth(false);
            history.push('/');
        } else
        {
            setAuth(true);
            document.title="CryptoQuest|Ranking"
        }
    },[configs.isUser()]);

    React.useEffect(() => {
        setLoading(!fetched);
    }, [fetched]);

    React.useEffect(() => {
        if(auth)
        {
            setId(props.match.params.cid);
            setLoading(true);
            fetchSolutions();
        }  
    }, [props.match.params.cid,auth]);
    
    React.useEffect(() => {
        if (contestInfo)
        {
            var status =configs.flagRank(contestInfo, globalTime);
            if(contestInfo.status.isRanklist!==status.isRanklist)
            {
                console.log(status);
                contestInfo.status=status;
                setLoading(true);
                fetchSolutions();
            }
        }
    }, [contestInfo,globalTime]);

    return (
        <>
            <br />
            {contestInfo !== null && fetched!== -1 && <Typography variant="h4" display="block" color="textPrimary" align="center">
                Contest Name: <b>{contestInfo.name}</b>
            </Typography>}
            <br />
            {ranklist.length !== 0 && ranklist[0]!== null && <TableContainer component={Paper} elevation={10} style={{opacity: 0.9}}>
            <Table className={classes.table} aria-label="customized table">
                <TableHead>
                <TableRow>
                    <StyledTableCell>#</StyledTableCell>
                    <StyledTableCell align="center">Email ID&nbsp;</StyledTableCell>
                    <StyledTableCell align="center">Points</StyledTableCell>
                </TableRow>
                </TableHead>
                <TableBody>
                {ranklist.map((k,i) => (
                    <StyledTableRow key={k.email}>
                    <StyledTableCell component="th" scope="row">
                        {i+1}
                    </StyledTableCell>
                    <StyledTableCell align="center">{k.email}</StyledTableCell>
                    <StyledTableCell align="center">{k.points}</StyledTableCell>
                    </StyledTableRow>
                ))}
                </TableBody>
            </Table>
            </TableContainer>}
            {ranklist.length !== 0 && ranklist[0] == null && <Typography paragraph variant="h4" display="block" color="secondary" align="center">
                <b>No user has solved any questions</b>
            </Typography>}
            {fetched ===1 && ranklist.length === 0 && <Typography paragraph variant="h4" display="block" color="secondary" align="center">
                <b><i>Contest ID is invalid :(</i></b>
            </Typography>}
            {fetched ===-1&& <Typography paragraph variant="h4" display="block" color="secondary" align="center">
                <b><i>Ranklist Hidden :(</i></b>
            </Typography>}
        </>
        
      );
}

export default Ranking;