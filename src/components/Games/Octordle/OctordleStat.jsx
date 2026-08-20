import { useState, useEffect } from 'react';
import Axios from 'axios';
import './OctordleScores.css';
import { Container, Row, Col } from 'react-bootstrap';
import Octordlestatistics from './OctordleStatistics';
import OctordlePlayService from './OctordlePlayService';
import OctordleScoreByDate from './OctordleScoreByDate';
import GroupButtonsRow from '../GroupButtonsRow';

function Octordletat() {
    const baseURL = import.meta.env.VITE_BASE_URL;
    const USER_AUTH_DATA = JSON.parse(localStorage.getItem('auth'));
    const loginuserEmail = USER_AUTH_DATA?.email; // Optional chaining to avoid errors

    const [statschart, setStatsChart] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (loginuserEmail) {
            getStatChart();
        }
    }, [loginuserEmail]); // Ensure this depends on loginuserEmail

    function getStatChart() {

        const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        const localDate = new Date();
        // Get time zone offset in minutes
        const offsetMinutes = localDate.getTimezoneOffset();  // Offset in minutes (positive for behind UTC, negative for ahead)

        // Now adjust the time by adding the time zone offset (this does not affect UTC, it gives the correct local time)
        const adjustedDate = new Date(localDate.getTime() - offsetMinutes * 60 * 1000); // Adjust time by the offset in milliseconds

        const todayDate = adjustedDate.toISOString().split("T")[0];

        Axios.get(`${baseURL}/games/octordle/get-score.php`, {
            params: { useremail: loginuserEmail, timeZone:timeZone, today: todayDate }
        })
        .then((res) => {
            if (res.data.status === "success") {
                const scoreData = res.data.octordlescore;
                setStatsChart(scoreData); // Update state with the score data
                setLoading(false); // Set loading to false once data is fetched
            } else {
                setLoading(false);
            }
        })
        .catch((error) => {
            console.error("Error fetching data: ", error);
            setLoading(false);
        });
    }

    // Board-picture rows are all-emoji lines (no ASCII letters), and are
    // neither the "Daily Octordle #NNNN" header nor the "Score: NN" line.
    const extractBoardLines = (text) =>
        text
            .split("\n")
            .map(l => l.trim())
            .filter(l => l && !l.startsWith("Daily Octordle") && !l.startsWith("Score:") && !/[a-zA-Z]/.test(l))
            .join("\n");

    return (
        <Container>
            <Row className='align-items-center justify-content-center'>
                <Col md={12} className='border p-3 shadow rounded'>
                    <Row>
                        <Col md={4} className="m-auto p-3">
                            <div>
                                {loading ? (
                                    <div className='text-center my-4'>
                                        <h4 className="my-2 font-weight-bold fs-4 text-center pb-3">Today's Result</h4>
                                        <p>Loading...</p>
                                    </div>
                                ) : (
                                    statschart && Array.isArray(statschart) && statschart.length > 0 ? (
                                        statschart.map((char, index) => {

                                            const cleanedScore = char.octordlescore
                                                .split("\n")
                                                .map(line => line.trim())
                                                .find(line => line.startsWith("Daily Octordle")) || "";

                                            const octordleScore = extractBoardLines(char.octordlescore);
                                            const createDate = char.createdat; // Ensure this matches your database field name
                                            const date = new Date(createDate);
                                            const todayDate = date.toLocaleDateString('en-US', {
                                                            year: 'numeric',
                                                            month: 'long',
                                                            day: 'numeric',
                                                            });
                                            const gamleScore = char.gamlescore;
                                            const gamlerAverage = char.gamlerAverage;
                                            return (

                                                <div key={index}>
                                                    <div className="todays-result-box todays-result-box-octordle">
                                                        <h4 className="my-2 font-weight-bold fs-4 text-center pb-3">Today's Result</h4>
                                                        <div className={`wordle-score-board-text my-3 fs-5 text-center`}>{cleanedScore}</div>
                                                        <div className='today text-center fs-6 my-2 fw-bold'>{todayDate}</div>
                                                        <pre className='text-center'>
                                                           {octordleScore}
                                                        </pre>
                                                        <h5 className='text-center'>Gamle Score: {gamleScore}</h5>
                                                    </div>
                                                    {gamlerAverage !== null && gamlerAverage !== undefined && (
                                                        <div className='gamler-average-bar text-center fw-bold py-2 my-3 rounded text-uppercase'>
                                                            Gamler Average: {gamlerAverage}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })
                                    ) : (
                                        <div className='text-center my-4'>
                                            <h4 className="my-2 font-weight-bold fs-4 text-center pb-3">Today's Result</h4>
                                            <p>You have not played today.</p>
                                            <OctordlePlayService updateStatsChart={getStatChart}/>
                                        </div>
                                    )
                                )}
                            </div>
                        </Col>
                    </Row>
                    <Row className='align-items-center justify-content-center'>
                        <Col md={4}>
                            <GroupButtonsRow />
                        </Col>
                    </Row>
                    <Row className='align-items-center justify-content-center'>
                        <Col md={4}>
                            <Octordlestatistics statschart={statschart}/>
                        </Col>
                    </Row>
                    <Row className='align-items-center justify-content-center'>
                        <Col md={4} className='text-align-center py-5'>
                            <OctordleScoreByDate/>
                        </Col>
                    </Row>
                </Col>
            </Row>
        </Container>
    );
}

export default Octordletat;
