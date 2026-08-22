import { useState, useEffect } from 'react';
import Axios from 'axios';
import QuordleGuessDistribution from './QuordleGuessDistribution';

function QuordleStatistics({ statschart }) {
    const baseURL = import.meta.env.VITE_BASE_URL;
    const USER_AUTH_DATA = JSON.parse(localStorage.getItem('auth'));
    const loginuserEmail = USER_AUTH_DATA.email;
    const [totalGame, setTotalGame] = useState('');
    const [totalWin, setTotalWin] = useState('');
    const [QuordleStatsData, setQuordleStatsData] = useState();
    const [currentStreak, setcurrentStreak] = useState();
    const [maxStreak, setmaxStreak] = useState();
    const [guessDistribution, setguessDistribution] = useState();
    const [perfectPuzzles, setperfectPuzzles] = useState();
    const [purpleFirst, setpurpleFirst] = useState();
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
        Axios.get(`${baseURL}/games/quordle/get-statistics.php?useremail=${loginuserEmail}`)
            .then((response) => {
                if (typeof updateStatistics === 'function') {
                    updateStatistics();
                }
                const statistics = response.data.statistics;
                console.log(statistics);
                setQuordleStatsData(statistics);
                setTotalGame(statistics.totalGamesPlayed);
                setTotalWin(statistics.winPercentage);
                setcurrentStreak(statistics.currentStreak);
                setmaxStreak(statistics.maxStreak);
                setguessDistribution(statistics.guessDistribution);    
                setperfectPuzzles(statistics.perfectPuzzles);
                setpurpleFirst(statistics.purpleFirst);
                setLast7Streak(statistics.last7Streak);
                setLast7Average(statistics.last7Average);
                setCumulativeAvgEntered(statistics.cumulativeAvgEntered);
                setCumulativeAvgInclNoPlay(statistics.cumulativeAvgInclNoPlay);
            })
            .catch((error) => {
                console.error("Error fetching data: ", error);
                
            });
    }

    const WinningPercent = Math.round((totalWin / totalGame) * 100);
    const isValidNumber = !isNaN(WinningPercent);
    
    return (
            <div className="statistics">
                <h2 className='text-uppercase'>Statistics</h2>
        
                {QuordleStatsData ? (
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
                            <QuordleGuessDistribution guessDistribution={guessDistribution} />
                        </div>
    
                    </>
                ) : (
                    <div>Data Not Found</div>
                )}
            </div>
        );
}

export default QuordleStatistics;
