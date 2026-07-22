import React from "react";
import { ProgressBar } from "react-bootstrap";

function QuordleGuessDistribution({ guessDistribution }) {

    if (!guessDistribution) {
        return null;
    }

    return (
        <>
            <h2 className="text-uppercase">Mistake Distribution</h2>

            {Object.entries(guessDistribution).map(([guess, data]) => (
                <div key={guess} className="mb-2">
                    <div className="d-flex align-items-center">

                        {/* Guess Number */}
                        <div
                            className="text-end"
                            style={{
                                width: "15%",
                                textAlign: "center",
                                fontWeight: "bold"
                            }}
                        >
                            {guess}
                        </div>


                        {/* Progress Bar */}
                        <div
                            style={{
                                width: "75%",
                                margin: "0 10px",
                                position: "relative"
                            }}
                        >
                            <ProgressBar
                                className="quordle-progress-bar"
                                now={data.percent}
                                label=""
                            />

                            <span className="progress-label">
                                {data.count > 0 ? data.count : ''}
                            </span>
                        </div>


                        {/* Percentage */}
                        <div
                            style={{
                                width: "5%",
                                textAlign: "right",
                                fontSize: "0.9rem"
                            }}
                        >
                            {`${data.percent.toFixed(0)}%`}
                        </div>

                    </div>
                </div>
            ))}
        </>
    );
}

export default QuordleGuessDistribution;