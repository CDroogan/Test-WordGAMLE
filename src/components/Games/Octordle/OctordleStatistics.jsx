import { useState, useEffect } from 'react';
import Axios from 'axios';
import OctordleGuessDistribution from './OctordleGuessDistribution';

function OctordleStatistics({ statschart }) {
    const baseURL = import.meta.env.VITE_BASE_URL;
    const USER_AUTH_DATA = JSON.parse(localStorage.getItem('auth'));
    const loginuserEmail = USER_AUTH_DATA?.email;
    const [totalGame, setTotalGame] = useState('');
    const [totalWin, setTotalWin] = useState('');
    const [OctordleStatsData, setOctordleStatsData] = useState();
    const [currentStreak, setcurrentStreak] = useState();
    const [maxStreak, setmaxStreak] = useState();
    const [guessDistribution, setguessDistribution] = useState();
    const [last7Streak, setLast7Streak] = useState();
    const [last7Average, setLast7Average] = useState();
    const [cumulativeAvgEntered, setCumulativeAvgEntered] = useState();
    const [cumulativeAvgInclNoPlay, setCumulativeAvgInclNoPlay] = useState();

    useEffect(() => {
        if (loginuserEmail) {
            getStatsValue();
        }
      }, [statschart])

    function getStatsValue() {
        Axios.get(`${baseURL}/games/octordle/get-statistics.php?useremail=${loginuserEmail}`)
            .then((response) => {
                const statistics = response.data.statistics;
                setOctordleStatsData(statistics);
                setTotalGame(statistics.totalGamesPlayed);
                setTotalWin(statistics.winPercentage);
                setcurrentStreak(statistics.currentStreak);
                setmaxStreak(statistics.maxStreak);
                setguessDistribution(statistics.guessDistribution);
                setLast7Streak(statistics.last7Streak);
                setLast7Average(statistics.last7Average);
                setCumulativeAvgEntered(statistics.cumulativeAvgEntered);
                setCumulativeAvgInclNoPlay(statistics.cumulativeAvgInclNoPlay);
            })
            .catch((error) => {
                console.error("Error fetching data: ", error);

            });
    }

    return (
            <div className="statistics">
                <h2 className='text-uppercase'>Statistics</h2>

                {OctordleStatsData ? (
                    <>
                        <ul>
                            <li>
                                <div className='value'>{totalGame}</div>
                                <div className='bottom-text'>Played</div>
                            </li>
                            <li>
                                <div className='value'>{totalWin}</div>
                                <div className='bottom-text'>Win %</div>
                            </li>
                            <li>
                                <div className='value'>{currentStreak}</div>
                                <div className='bottom-text'>Win Streak</div>
                            </li>
                            <li>
                                <div className='value'>{maxStreak}</div>
                                <div className='bottom-text'>Max Streak</div>
                            </li>
                        </ul>
                        <ul>
                            <li>
                                <div className='value'>{last7Streak}</div>
                                <div className='bottom-text'>Last 7 Streak</div>
                            </li>
                            <li>
                                <div className='value'>{last7Average}</div>
                                <div className='bottom-text'>Last 7 Average</div>
                            </li>
                            <li>
                                <div className='value'>{cumulativeAvgEntered}</div>
                                <div className='bottom-text'>Cumulative Avg. Entered</div>
                            </li>
                            <li>
                                <div className='value'>{cumulativeAvgInclNoPlay}</div>
                                <div className='bottom-text'>Cumulative Avg. (incl. No Play)</div>
                            </li>
                        </ul>
                        <div className="guess-distribution my-4">
                            <OctordleGuessDistribution guessDistribution={guessDistribution} />
                        </div>

                    </>
                ) : (
                    <div>Data Not Found</div>
                )}
            </div>
        );
}

export default OctordleStatistics;
