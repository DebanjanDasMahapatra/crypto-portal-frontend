import React from 'react';
import axios from "axios";
import { configs } from "../../../globals";
import ReactHTMLTableToExcel from 'react-html-table-to-excel';
import {withStyles,makeStyles,Collapse,IconButton,Typography,Table,TableRow,TableBody, TableCell,TableContainer,TableHead,Paper,Card,CardContent} from '@material-ui/core';
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@material-ui/icons/KeyboardArrowUp';

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

const useRowStyles = makeStyles({
  root: {
    '& > *': {
      borderBottom: 'unset',
    },
    minWidth: 275,
  },
  title: {
    fontSize: 14,
  }
});

function Row(props) {
  const { row,i } = props;
  const [open, setOpen] = React.useState(false);
  const classes = useRowStyles();

  return (
    <React.Fragment>
      <StyledTableRow className={classes.root}>
        <StyledTableCell>
          {i+1}
        </StyledTableCell>
        <StyledTableCell component="th" scope="row">
          {row.email}<IconButton aria-label="expand row" size="small" onClick={() => setOpen(!open)}>
          {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
          <Collapse style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6} in={open} timeout="auto" unmountOnExit>
              <Card className={classes.root} elevation={5}>
                  <CardContent>
                      <Typography className={classes.title} color="textPrimary">
                      <b>Name:</b> {row.name}<br /><b>Contact #:</b> {row.contact}<br /><b>College:</b> {row.instituteName}
                      </Typography>
                  </CardContent>
              </Card>
          </Collapse>
        </StyledTableCell>
        <StyledTableCell hidden align="center">{row.name}</StyledTableCell>
        <StyledTableCell hidden align="center">{row.contact}</StyledTableCell>
        <StyledTableCell hidden align="center">{row.instituteName}</StyledTableCell>
        <StyledTableCell align="center">{row.questions.map((q, i) => <span key={q}>{i > 0 ? ", " : ""}{q}</span>)}</StyledTableCell>
        <StyledTableCell align="center">{row.questions.length}</StyledTableCell>
        <StyledTableCell align="center">{row.points}</StyledTableCell>
      </StyledTableRow>
    </React.Fragment>
  );
}

const AdminRanking = (props) => {
    const { history,setLoading, setSnack,socket} = props;
    const [auth, setAuth] = React.useState(false);
    const [ranklist, setRanklist] = React.useState([]);
    const [id, setId] = React.useState(props.match.params.cid);
    const [fetched, setFetched] = React.useState(false);

    const fetchSolutions = () => {
      setFetched(false);
        axios.get(`${configs.baseUrl}/admin/getSolutions/${id}`).then(
            result => {
                if (result.data.status) {
                    let solutions = result.data.data;
                    var userPoints = [];
                    let users = [];
                    if(solutions.length >0)
                    {
                        solutions.forEach(sol => {
                            var userI = users.indexOf(sol.userEmail);
                            if (userI === -1) {
                                users = [...users, sol.userEmail];
                                var newUserPoint = {
                                    'email': sol.userEmail,
                                    'points': sol.points,
                                    'questions': [sol.questionTitle],
                                    'createdAt': sol.createdAt,
                                    'name': sol.name,
                                    'contact': sol.contact,
                                    'instituteName': sol.instituteName
                                }
                                userPoints.push(newUserPoint);
                            }
                            else {
                                userPoints[userI].points += sol.points;
                                userPoints[userI].questions = [...userPoints[userI].questions, sol.questionTitle];
                                userPoints[userI].createdAt = sol.createdAt;
                            }
                        });
                        //Sort in terms of points
                        userPoints.sort(function (a, b) {
                            // return ((a.points < b.points) ? 1 : -1);
                            if (a.points < b.points)
                                return 1;
                            else if (a.points === b.points && a.createdAt > b.createdAt)
                                return 1;
                            else
                                return -1;
                        });
                        setRanklist(userPoints);
                        setSnack({ show: true, msg: result.data.message, status: result.data.status });
                        setLoading(false);
                    }
                    else
                        setLoading(false);
                    setFetched(true);
                }
                else
                {
                    setSnack({ show: true, msg: result.data.message, status: result.data.status });
                    setLoading(false);
                    if(result.status === 401)
                      configs.logout(socket);
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
        if (!configs.isLoggedIn()) {
            setAuth(false);
            history.push('/');
        } else
        {
            setAuth(true);
            document.title="CryptoQuest|Ranking"
        }
    },[configs.isAdmin()]);

    React.useEffect(() => {
        if(auth)
        {
            setLoading(true);
            fetchSolutions();
        }  
    }, [auth]);

    return (
        <>
            {/* 
            <ReactHTMLTableToExcel
                id="test-table-xls-button"
                className="download-table-xls-button"
                table="table-to-xls"
                filename="ranklist"
                sheet="tablexls"
                buttonText="Download as XLS" />
            */}
            {ranklist.length !==0 && <TableContainer component={Paper} elevation={10} style={{opacity: 0.9}}>
            <Table aria-label="collapsible table" id="table-to-xls">
                <TableHead>
                <StyledTableRow>
                    <StyledTableCell>#</StyledTableCell>
                    <StyledTableCell align="left">Email ID&nbsp;</StyledTableCell>
                    <StyledTableCell hidden align="center">Name</StyledTableCell>
                    <StyledTableCell hidden align="center">Contact</StyledTableCell>
                    <StyledTableCell hidden align="center">Institute Name</StyledTableCell>
                    <StyledTableCell align="center">&nbsp;Solved Questions</StyledTableCell>
                    <StyledTableCell align="center">No of Questions Solved</StyledTableCell>
                    <StyledTableCell align="center">Points</StyledTableCell>
                </StyledTableRow>
                </TableHead>
                <TableBody>
                {ranklist.map((k,i) => (
                    <Row key={k.email} row={k} i={i} />
                ))}
                </TableBody>
            </Table>
            </TableContainer>}
            {ranklist.length === 0 && fetched && <Typography paragraph variant="h4" display="block" color="secondary" align="center">
                <b>No user has solved any questions</b>
            </Typography>}
        </>
    );
}

export default AdminRanking;
