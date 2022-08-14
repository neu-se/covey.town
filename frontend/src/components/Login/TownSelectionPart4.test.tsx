import { ChakraProvider } from '@chakra-ui/react';
import '@testing-library/jest-dom';
import { render, RenderResult, waitFor } from '@testing-library/react';
import userEvent, { TargetElement } from '@testing-library/user-event';
import { nanoid } from 'nanoid';
import React from 'react';
import TownsServiceClient from '../../classes/TownsServiceClient';
import Video from '../../classes/Video/Video';
import CoveyAppContext from '../../contexts/CoveyAppContext';
import { ChatProvider } from '../VideoCall/VideoFrontend/components/ChatProvider';
import TownSelection from './TownSelection';

const mockConnect = jest.fn(() => Promise.resolve());

const mockToast = jest.fn();
jest.mock('../../classes/TownsServiceClient');
jest.mock('../../classes/Video/Video');
jest.mock('../VideoCall/VideoFrontend/hooks/useVideoContext/useVideoContext.ts', () => ({
  __esModule: true, // this property makes it work
  default: () => ({ connect: mockConnect }),
}));
jest.mock('@chakra-ui/react', () => {
  const ui = jest.requireActual('@chakra-ui/react');
  const mockUseToast = () => mockToast;
  return {
    ...ui,
    useToast: mockUseToast,
  };
});
const doLoginMock = jest.fn();
const mocklistTowns = jest.fn();
const mockCreateTown = jest.fn();
const mockVideoSetup = jest.fn();
const mockSignUp = jest.fn();
TownsServiceClient.prototype.listTowns = mocklistTowns;
TownsServiceClient.prototype.createTown = mockCreateTown;
TownsServiceClient.prototype.signUp = mockSignUp;
Video.setup = mockVideoSetup;

const listTowns = (suffix: string) =>
  Promise.resolve({
    towns: [
      {
        friendlyName: `town1${suffix}`,
        coveyTownID: `1${suffix}`,
        currentOccupancy: 0,
        maximumOccupancy: 1,
      },
      {
        friendlyName: `town2${suffix}`,
        coveyTownID: `2${suffix}`,
        currentOccupancy: 2,
        maximumOccupancy: 10,
      },
      {
        friendlyName: `town3${suffix}`,
        coveyTownID: `3${suffix}`,
        currentOccupancy: 1,
        maximumOccupancy: 1,
      },
      {
        friendlyName: `town4${suffix}`,
        coveyTownID: `4${suffix}`,
        currentOccupancy: 8,
        maximumOccupancy: 8,
      },
      {
        friendlyName: `town5${suffix}`,
        coveyTownID: `5${suffix}`,
        currentOccupancy: 9,
        maximumOccupancy: 5,
      },
      {
        friendlyName: `town6${suffix}`,
        coveyTownID: `6${suffix}`,
        currentOccupancy: 99,
        maximumOccupancy: 100,
      },
    ]
      .map(a => ({
        sort: Math.random(),
        value: a,
      }))
      .sort((a, b) => a.sort - b.sort)
      .map(a => a.value),
  });

function wrappedTownSelection() {
  return (
    <ChakraProvider>
      <CoveyAppContext.Provider
        value={{
          myPlayerID: '',
          currentTownID: '',
          currentTownIsPubliclyListed: false,
          currentTownFriendlyName: '',
          sessionToken: '',
          userName: '',
          socket: null,
          emitMovement: () => {},
          apiClient: new TownsServiceClient(),
        }}>
        <ChatProvider>
          <TownSelection doLogin={doLoginMock} />
        </ChatProvider>
      </CoveyAppContext.Provider>
    </ChakraProvider>
  );
}

describe('Sign up functionality', () => {
  let renderData: RenderResult<typeof import('@testing-library/dom/types/queries')>;
  let newUserNameField: HTMLInputElement;
  let newEmailField: HTMLInputElement;
  let newPasswordField: HTMLInputElement;
  let newConfirmPasswordField: HTMLInputElement;
  let signUpButton: TargetElement;

  beforeEach(async () => {
    mocklistTowns.mockReset();
    doLoginMock.mockReset();
    mockConnect.mockReset();
    mockToast.mockReset();
    mockVideoSetup.mockReset();
    mockCreateTown.mockReset();
    mockSignUp.mockReset();

    // Assemble all the testing envirnment
    mocklistTowns.mockImplementation(() => listTowns(nanoid()));
    renderData = render(wrappedTownSelection());
    newUserNameField = renderData.getByPlaceholderText('Your user name') as HTMLInputElement;
    newEmailField = renderData.getByPlaceholderText('Your email') as HTMLInputElement;
    newPasswordField = renderData.getByPlaceholderText('Your password') as HTMLInputElement;
    newConfirmPasswordField = renderData.getByPlaceholderText(
      'Confirm your password',
    ) as HTMLInputElement;
    signUpButton = renderData.getByRole('button', { name: 'Sign up!' });
  });
  it('should send out sign up request', async () => {
    // Start to Act
    userEvent.type(newUserNameField, 'Nice guy');
    userEvent.type(newEmailField, 'tom@example.com');
    userEvent.type(newPasswordField, '123456');
    userEvent.type(newConfirmPasswordField, '123456');
    userEvent.click(signUpButton);
    // Start to Assert
    await waitFor(() => {
      expect(newUserNameField.value).toBe('Nice guy');
      expect(newEmailField.value).toBe('tom@example.com');
      expect(newPasswordField.value).toBe('123456');
      expect(newConfirmPasswordField.value).toBe('123456');
      expect(mockToast).toBeCalledWith({
        title: 'Successfully sign up!',
        status: 'success',
      });
      expect(mockSignUp).toBeCalledWith({
        userName: 'Nice guy',
        email: 'tom@example.com',
        password: '123456',
      });
    });
  });

  it('should failed when two password are not match', async () => {
    userEvent.type(newUserNameField, 'Nice guy');
    userEvent.type(newEmailField, 'tom@example.com');
    userEvent.type(newPasswordField, '123456');
    userEvent.type(newConfirmPasswordField, '13456');
    userEvent.click(signUpButton);
    await waitFor(() => {
      expect(newUserNameField.value).toBe('Nice guy');
      expect(newEmailField.value).toBe('tom@example.com');
      expect(newPasswordField.value).toBe('123456');
      expect(newConfirmPasswordField.value).toBe('13456');
      expect(mockToast).toBeCalledWith({
        title: 'Unable to sign up user',
        description: 'Confirm password not match',
        status: 'error',
      });
      expect(mockSignUp).not.toHaveBeenCalled();
    });
  });

  it('zero length user name should failed', async () => {
    userEvent.type(newUserNameField, '');
    userEvent.type(newEmailField, 'tom@example.com');
    userEvent.type(newPasswordField, '123456');
    userEvent.type(newConfirmPasswordField, '13456');
    userEvent.click(signUpButton);
    await waitFor(() => {
      expect(newUserNameField.value).toBe('');
      expect(newEmailField.value).toBe('tom@example.com');
      expect(newPasswordField.value).toBe('123456');
      expect(newConfirmPasswordField.value).toBe('13456');
      expect(mockToast).toBeCalledWith({
        title: 'Unable to sign up user',
        description: 'Please enter a username before sign up user',
        status: 'error',
      });
      expect(mockSignUp).not.toHaveBeenCalled();
    });
  });

  it('zero length email should failed', async () => {
    userEvent.type(newUserNameField, 'Nice guy');
    userEvent.type(newEmailField, '');
    userEvent.type(newPasswordField, '123456');
    userEvent.type(newConfirmPasswordField, '13456');
    userEvent.click(signUpButton);
    await waitFor(() => {
      expect(newUserNameField.value).toBe('Nice guy');
      expect(newEmailField.value).toBe('');
      expect(newPasswordField.value).toBe('123456');
      expect(newConfirmPasswordField.value).toBe('13456');
      expect(mockToast).toBeCalledWith({
        title: 'Unable to sign up user',
        description: 'Please enter a email before sign up user',
        status: 'error',
      });
      expect(mockSignUp).not.toHaveBeenCalled();
    });
  });

  it('an email should contain the @ symbol', async () => {
    userEvent.type(newUserNameField, 'jacky');
    userEvent.type(newEmailField, 'jackygmail.com');
    userEvent.type(newPasswordField, '123456');
    userEvent.type(newConfirmPasswordField, '123456');
    userEvent.click(signUpButton);
    await waitFor(() => {
      expect(newUserNameField.value).toBe('jacky');
      expect(newEmailField.value).toBe('jackygmail.com');
      expect(newPasswordField.value).toBe('123456');
      expect(newConfirmPasswordField.value).toBe('123456');
      expect(mockToast).toBeCalledWith({
        title: 'Unable to sign up user',
        description: 'An email should contain the @ symbol',
        status: 'error',
      });
      expect(mockSignUp).not.toHaveBeenCalled();
    });
  });

  it('zero password should failed', async () => {
    userEvent.type(newUserNameField, 'Nice guy');
    userEvent.type(newEmailField, 'tom@example.com');
    userEvent.type(newPasswordField, '');
    userEvent.type(newConfirmPasswordField, '');
    userEvent.click(signUpButton);
    await waitFor(() => {
      expect(newUserNameField.value).toBe('Nice guy');
      expect(newEmailField.value).toBe('tom@example.com');
      expect(newPasswordField.value).toBe('');
      expect(newConfirmPasswordField.value).toBe('');
      expect(mockToast).toBeCalledWith({
        title: 'Unable to sign up user',
        description: 'Please enter a newPassword before sign up user',
        status: 'error',
      });
      expect(mockSignUp).not.toHaveBeenCalled();
    });
  });

  it('should correctly show error message', async () => {
    mockSignUp.mockImplementation(() => {
      throw new Error();
    });
    userEvent.type(newUserNameField, 'Nice guy');
    userEvent.type(newEmailField, 'tom@example.com');
    userEvent.type(newPasswordField, '123456');
    userEvent.type(newConfirmPasswordField, '123456');
    userEvent.click(signUpButton);
    await waitFor(() => {
      expect(newUserNameField.value).toBe('Nice guy');
      expect(newEmailField.value).toBe('tom@example.com');
      expect(newPasswordField.value).toBe('123456');
      expect(newConfirmPasswordField.value).toBe('123456');
      expect(mockToast).toBeCalledWith({
        title: 'Unable to create user',
        description: 'Error',
        status: 'error',
      });
    });
  });
});
