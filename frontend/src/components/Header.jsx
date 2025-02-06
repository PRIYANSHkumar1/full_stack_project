import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar, Nav, Container, Badge, NavDropdown } from 'react-bootstrap';
import { FaShoppingCart, FaUser } from 'react-icons/fa';
import { LinkContainer } from 'react-router-bootstrap';
import { useSelector, useDispatch } from 'react-redux';
import { useLogoutMutation } from '../slices/usersApiSlice';
import { logout } from '../slices/authSlice';
import { toast } from 'react-toastify';
import SearchBox from './SearchBox';
import { useLocation } from 'react-router-dom';

const Header = () => {
  const { cartItems } = useSelector(state => state.cart);
  const { userInfo } = useSelector(state => state.auth);
  const [logoutApiCall] = useLogoutMutation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const isAuthPage = ['/login', '/register'].includes(location.pathname);

  const logoutHandler = async () => {
    try {
      await logoutApiCall().unwrap();
      dispatch(logout());
      navigate('/login');
      toast.success('Logout successful');
    } catch (error) {
      toast.error(error?.data?.message || error.error);
    }
  };

  return (
    <Navbar
      bg='primary'
      variant='dark'
      expand='lg'
      collapseOnSelect
      className='fixed-top shadow-sm'
    >
      <Container>
        <LinkContainer to='/'>
          <Navbar.Brand className='fw-bold fs-4'>
            <span className='text-warning'>SHOP</span>WAVE
          </Navbar.Brand>
        </LinkContainer>
        <Navbar.Toggle aria-controls='basic-navbar-nav' />
        <Navbar.Collapse id='basic-navbar-nav'>
          <Nav className='me-auto'>
            {!isAuthPage && <SearchBox />}
          </Nav>
          <Nav className='d-flex align-items-center gap-3'>
            <LinkContainer to='/cart'>
              <Nav.Link className='position-relative'>
                <FaShoppingCart size={20} />
                {cartItems.length > 0 && (
                  <Badge 
                    pill 
                    bg='danger'
                    className='position-absolute top-0 start-100 translate-middle'
                  >
                    {cartItems.reduce((acc, item) => acc + item.qty, 0)}
                  </Badge>
                )}
              </Nav.Link>
            </LinkContainer>
            {userInfo ? (
              <NavDropdown 
                title={
                  <span className='text-light'>
                    <FaUser className='me-2' />
                    {userInfo.name}
                  </span>
                } 
                id='username'
                align='end'
              >
                <LinkContainer to='/profile'>
                  <NavDropdown.Item className='py-2'>
                    <i className='fas fa-user me-2'></i> Profile
                  </NavDropdown.Item>
                </LinkContainer>
                <NavDropdown.Divider />
                <NavDropdown.Item 
                  onClick={logoutHandler}
                  className='py-2 text-danger'
                >
                  <i className='fas fa-sign-out-alt me-2'></i> Logout
                </NavDropdown.Item>
              </NavDropdown>
            ) : (
              <LinkContainer to='/login'>
                <Nav.Link className='d-flex align-items-center'>
                  <FaUser className='me-2' />
                  Sign In
                </Nav.Link>
              </LinkContainer>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Header;