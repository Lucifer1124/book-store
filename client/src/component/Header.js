import { UserOutlined } from "@ant-design/icons";
import { Col, Popover, Row } from "antd";
import React from "react";
import '../App.css'
import BookStore from '../images/book-store.jpg'

const Header = () => {
    const getContent = () => {
        return (
            <div className="padding-20">
                <div>
                    <span className="fs-16">
                        Welcome Admin
                    </span>
                </div>
            </div>
        )
    }
    return (
        <Row className="padding-20 box-shadow">
            <Col xs={18} sm={18} md={18} lg={18}>
                <div>
                    {/* <span><img src={BookStore} style={{height: '32px', width:'32px'}}/></span> */}
                    <span style={{ marginLeft: '10px' }}>Book House</span>
                </div>
            </Col>
            <Col xs={6} sm={6} md={6} lg={6} style={{paddingRight: '20px'}}>
                <div className="text-right">
                    <span>
                        <Popover placement="bottom" content={getContent()} trigger='click'>
                            <UserOutlined />
                        </Popover>
                    </span>
                </div>
            </Col>
        </Row>
    )
}

export default Header;