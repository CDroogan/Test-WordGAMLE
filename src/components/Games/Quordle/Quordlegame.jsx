import React from 'react';
import { Row, Col, Button} from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import QuordlePlayService from './QuordlePlayService';

const Quordlegame = () => {
    const navigate = useNavigate();

    const handleWordlestate = async (event) => {
        event.preventDefault();
        navigate('/quordlestats');
    };
    
    return (
        <>
            <Row>
                <Col className="text-start">
                    <QuordlePlayService/>
                </Col>
                <Col className="text-end">
                    <div className="my-3">
                        <Button className="Quordle-btn px-5" onClick={handleWordlestate}>
                            Stats
                        </Button>
                    </div>
                </Col>
            </Row>
        </>
    );
};

export default Quordlegame;
