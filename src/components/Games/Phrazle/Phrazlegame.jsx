import React from 'react';
import { Row, Col, Button} from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import PhrazlePlayService from './PhrazlePlayService';

const Phrazlegame = ({ groupId, gameName, userId }) => {
    const navigate = useNavigate();

    const handleConnectionstate = async (event) => {
        event.preventDefault();
        navigate('/phrazlestats');
    };
    
    return (
        <>
            <Row>
                <Col className="text-start">

                    <PhrazlePlayService groupId={groupId} gameName={gameName} userId={userId} />
                </Col>
                <Col className="text-end">
                    <div className="my-3">
                        <Button className="phrazle-btn px-5" onClick={handleConnectionstate}>
                            Stats
                        </Button>
                    </div>
                </Col>
            </Row>
        </>
    );
};

export default Phrazlegame;
