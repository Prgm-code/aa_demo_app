import { render, fireEvent, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import AppBar from './AppBar';
import useAccountAbstractionStore from '@/stores/accountAbstraccionStore';

jest.mock('@/stores/accountAbstractionStore', () => ({
    __esModule: true,
    default: () => ({
      web3Provider: null,
      initialize: jest.fn(),
      cleanUp: jest.fn(),
      login: jest.fn(),
      logout: jest.fn(),
      isAuthenticated: false,
      userInfo: {},
      eoa: '',
      safes: [],
      // ... other properties and methods
    }),
  }));

// Utility for rendering the component with a particular store state
const renderWithState = (stateOverrides: any) => {
    (useAccountAbstractionStore as jest.Mock).mockReturnValue({
        ...useAccountAbstractionStore(),
        ...stateOverrides,
        });

        
    return render(<AppBar />);
};

// Tests...


//test 
describe('AppBar', () => {
  it('renders the login button when not authenticated', () => {
    renderWithState({ isAuthenticated: false });
    expect(screen.getByText(/login/i)).toBeInTheDocument();
  });

  it('renders the user info when authenticated', () => {
    renderWithState({
      isAuthenticated: true,
      userInfo: { name: 'John Doe', email: 'john@example.com', profileImage: 'profile.jpg' },
      eoa: '0x123',
    });
    expect(screen.getByText(/hello john doe/i)).toBeInTheDocument();
    expect(screen.getByText(/logout/i)).toBeInTheDocument();
  });

  it('calls logout when the logout button is clicked', () => {
    const logoutMock = jest.fn();
    renderWithState({ isAuthenticated: true, logout: logoutMock });

    fireEvent.click(screen.getByText(/logout/i));
    expect(logoutMock).toHaveBeenCalled();
  });

  it('calls login when the login button is clicked', () => {
    const loginMock = jest.fn();
    renderWithState({ isAuthenticated: false, login: loginMock });

    fireEvent.click(screen.getByText(/login/i));
    expect(loginMock).toHaveBeenCalled();
  });

  // Añadir más pruebas según sea necesario para cubrir diferentes estados y propiedades
});
