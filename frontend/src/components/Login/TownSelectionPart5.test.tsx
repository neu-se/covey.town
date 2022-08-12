import React from 'react'
import '@testing-library/jest-dom'
import { ChakraProvider } from '@chakra-ui/react'
import { render, RenderResult, waitFor} from '@testing-library/react'
import { nanoid } from 'nanoid';
import userEvent, { TargetElement } from '@testing-library/user-event';
import TownsServiceClient from '../../classes/TownsServiceClient';
import TownSelection from './TownSelection';
import Video from '../../classes/Video/Video';
import CoveyAppContext from '../../contexts/CoveyAppContext';
import { ChatProvider } from '../VideoCall/VideoFrontend/components/ChatProvider';

const mockConnect = jest.fn(() => Promise.resolve());

const mockToast = jest.fn();
jest.mock('../../classes/TownsServiceClient');
jest.mock('../../classes/Video/Video');
jest.mock('../VideoCall/VideoFrontend/hooks/useVideoContext/useVideoContext.ts', () => ({
  __esModule: true, // this property makes it work
  default: () => ({ connect: mockConnect })
}));
jest.mock("@chakra-ui/react", () => {
  const ui = jest.requireActual("@chakra-ui/react");
  const mockUseToast = () => (mockToast);
  return {
    ...ui,
    useToast: mockUseToast,
  };
})
const doLoginMock = jest.fn();
const mocklistTowns = jest.fn();
const mockCreateTown = jest.fn();
const mockVideoSetup = jest.fn();
const mockSignIn = jest.fn();
TownsServiceClient.prototype.listTowns = mocklistTowns;
TownsServiceClient.prototype.createTown = mockCreateTown;
TownsServiceClient.prototype.signIn = mockSignIn;
Video.setup = mockVideoSetup;


const listTowns = (suffix: string) => Promise.resolve({
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
  ].map(a => ({
    sort: Math.random(),
    value: a
  }))
    .sort((a, b) => a.sort - b.sort)
    .map((a) => a.value)
});

function wrappedTownSelection() {
  return <ChakraProvider><CoveyAppContext.Provider value={{
    myPlayerID: '',
    currentTownID: '',
    currentTownIsPubliclyListed: false,
    currentTownFriendlyName: '',
    sessionToken: '',
    userName: '',
    socket: null,
    emitMovement: () => {
    },
    apiClient: new TownsServiceClient(),
  }}><ChatProvider>
    <TownSelection doLogin={doLoginMock}/></ChatProvider></CoveyAppContext.Provider></ChakraProvider>;
}

describe('Sign up functionality', () => {
  let renderData: RenderResult<typeof import("@testing-library/dom/types/queries")>;
  
  let returningLoginField: HTMLInputElement;
  let returningPasswordField: HTMLInputElement;
  let signInButton: TargetElement;
  

  beforeEach(async () => {
    mocklistTowns.mockReset();
    doLoginMock.mockReset();
    mockConnect.mockReset();
    mockToast.mockReset();
    mockVideoSetup.mockReset();
    mockCreateTown.mockReset();
    mockSignIn.mockReset();

    // Assemble all the testing envirnment
    mocklistTowns.mockImplementation(() => listTowns(nanoid()));
    renderData = render(wrappedTownSelection());
    returningLoginField = renderData.getByPlaceholderText('Your Email') as HTMLInputElement;
    returningPasswordField = renderData.getByPlaceholderText('Your login password') as HTMLInputElement;
    signInButton = renderData.getByRole('button', {name:'Sign in!'});
  })

  it('zero length returning user should failed', async () => {
    userEvent.type(returningLoginField, '');
    userEvent.type(returningPasswordField, '123456');
    userEvent.click(signInButton);

    await waitFor(() => {
      expect(returningLoginField.value).toBe('')
      expect(returningPasswordField.value).toBe('123456')
      expect(mockToast)
        .toBeCalledWith({
          title: 'Unable to sign in user',
          description: 'Please enter a email before signin',
          status: 'error',
        })
      expect(mockSignIn).not.toHaveBeenCalled()
    })
  })

  it('zero length returning user should failed', async () => {
    userEvent.type(returningLoginField, 'jacky@gmail.com');
    userEvent.type(returningPasswordField, '');
    userEvent.click(signInButton);

    await waitFor(() => {
      expect(returningLoginField.value).toBe('jacky@gmail.com')
      expect(returningPasswordField.value).toBe('')
      expect(mockToast)
        .toBeCalledWith({
          title: 'Unable to sign in user',
          description: 'Please enter your password before signin',
          status: 'error',
        })
      expect(mockSignIn).not.toHaveBeenCalled()
    })
  })

  it('email should include @ symbol', async () => {
    userEvent.type(returningLoginField, 'jackygmail.com');
    userEvent.type(returningPasswordField, '');
    userEvent.click(signInButton);

    await waitFor(() => {
      expect(returningLoginField.value).toBe('jackygmail.com')
      expect(returningPasswordField.value).toBe('')
      expect(mockToast)
        .toBeCalledWith({
          title: 'Unable to sign in user',
          description: 'An email should contain the @ symbol',
          status: 'error',
        })
      expect(mockSignIn).not.toHaveBeenCalled()
    })
  })
})