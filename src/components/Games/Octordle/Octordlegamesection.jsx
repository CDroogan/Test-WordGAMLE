import React from 'react';
import { Row, Col } from 'react-bootstrap';
import Octordlegame from './Octordlegame';

function Octordlegamesection() {
    const USER_AUTH_DATA = JSON.parse(localStorage.getItem('auth'));
    const userData = USER_AUTH_DATA;

    return (
        <Col sm={6} className='border p-3 shadow rounded text-center '>
            <Row className='justify-content-between align-items-center'>
                <Col sm={3} className='text-center'>
                    <h5 className='shadow p-2 bg-body rounded'>Octordle</h5>
                </Col>
                <Col sm={6}><Octordlegame loginUserData = {userData}/></Col>
            </Row>
        </Col>
    )
}

export default Octordlegamesection
