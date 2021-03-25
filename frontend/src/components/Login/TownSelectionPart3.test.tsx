/* eslint-disable no-await-in-loop,@typescript-eslint/no-loop-func,no-restricted-syntax */
import React from 'react'
import '@testing-library/jest-dom'
import { ChakraProvider } from '@chakra-ui/react'
import { fireEvent, render, RenderResult, waitFor } from '@testing-library/react'
import userEvent, { TargetElement } from '@testing-library/user-event'
import { nanoid } from 'nanoid';
import TownsServiceClient from '../../classes/TownsServiceClient';
import TownSelection from './TownSelection';
import Video from '../../classes/Video/Video';
import CoveyAppContext from '../../contexts/CoveyAppContext';

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
TownsServiceClient.prototype.listTowns = mocklistTowns;
TownsServiceClient.prototype.createTown = mockCreateTown;
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
    nearbyPlayers: { nearbyPlayers: [] },
    players: [],
    myPlayerID: '',
    currentTownID: '',
    currentTownIsPubliclyListed: false,
    currentTownIsMergeable: false,
    currentTownFriendlyName: '',
    sessionToken: '',
    userName: '',
    socket: null,
    currentLocation: {
      x: 0,
      y: 0,
      rotation: 'front',
      moving: false,
    },
    emitMovement: () => {
    },
    apiClient: new TownsServiceClient(),
  }}>
    <TownSelection doLogin={doLoginMock}/></CoveyAppContext.Provider></ChakraProvider>;
}

describe('Town Selection - depends on Part 1 passing', () => {
  let renderData: RenderResult<typeof import("@testing-library/dom/types/queries")>;
  let newTownNameField: HTMLInputElement;
  let newTownIsPublicCheckbox: HTMLInputElement;
  let userNameField: HTMLInputElement;
  let newTownButton: TargetElement;

  beforeEach(async () => {
    jest.useFakeTimers();
    mocklistTowns.mockReset();
    doLoginMock.mockReset();
    mockConnect.mockReset();
    mockToast.mockReset();
    mockVideoSetup.mockReset();
    mockCreateTown.mockReset();

    const suffix = nanoid();
    mocklistTowns.mockImplementation(() => listTowns(suffix));
    renderData = render(wrappedTownSelection());
    await waitFor(() => expect(renderData.getByText(`town1${suffix}`))
      .toBeInTheDocument());
    newTownIsPublicCheckbox = renderData.getByLabelText('Publicly Listed') as HTMLInputElement;
    newTownNameField = renderData.getByPlaceholderText('New Town Name') as HTMLInputElement;
    userNameField = renderData.getByPlaceholderText('Your name') as HTMLInputElement;
    newTownButton = renderData.getByTestId('newTownButton');
  });

  describe('Part 3 - Creating a new town', () => {

    const createTownWithOptions = async (params: { townName: string, userName: string, togglePublicBox?: boolean, townID?: string, roomPassword?: string, errorMessage?: string }) => {
      fireEvent.change(userNameField, { target: { value: params.userName } });
      await waitFor(() => {
        expect(userNameField.value)
          .toBe(params.userName);
      });
      fireEvent.change(newTownNameField, { target: { value: params.townName } });
      await waitFor(() => expect(newTownNameField.value)
        .toBe(params.townName));
      if (params.togglePublicBox) {
        fireEvent.click(newTownIsPublicCheckbox);
        await waitFor(() => expect(newTownIsPublicCheckbox.checked)
          .toBe(false));
      }
      mockCreateTown.mockReset();
      if (params.townID && params.roomPassword) {
        mockCreateTown.mockReturnValue({
          coveyTownID: params.townID,
          coveyRoomPassword: params.roomPassword
        });
      } else if (params.errorMessage) {
        mockCreateTown.mockRejectedValue(new Error(params.errorMessage));
      } else {
        fail('Invalid config');
      }
      userEvent.click(newTownButton);
    }
    describe('when clicking create', () => {
      describe('with invalid values', () => {
        it('displays an error toast "Unable to create town" if the username is empty', async () => {
          await createTownWithOptions({
            userName: '',
            townName: nanoid(),
            errorMessage: 'FAIL'
          })
          await waitFor(() => expect(mockToast)
            .toBeCalledWith({
              title: 'Unable to create town',
              description: 'Please select a username before creating a town',
              status: 'error'
            }));
        });
        it('displays an error toast "Unable to create town" if the newTownName is empty', async () => {
          await createTownWithOptions({
            townName: '',
            userName: nanoid(),
            errorMessage: 'FAIL'
          })
          await waitFor(() => expect(mockToast)
            .toBeCalledWith({
              title: 'Unable to create town',
              description: 'Please enter a town name',
              status: 'error'
            }));
        });
      });
      describe('with valid values', () => {

        it('calls createTown on the apiClient with the provided values (public town)', async () => {
          const townID = nanoid();
          const roomPassword = nanoid();
          const townName = nanoid();
          await createTownWithOptions({
            townName,
            userName: nanoid(),
            townID,
            roomPassword
          })
          await waitFor(() => expect(mockCreateTown)
            .toBeCalledWith({
              friendlyName: townName,
              isPubliclyListed: true,
              isMergeable: true
            }));
        });

        it('calls createTown on the apiClient with the provided values (not public town)', async () => {
          const townID = nanoid();
          const roomPassword = nanoid();
          const townName = nanoid();
          await createTownWithOptions({
            townName,
            userName: nanoid(),
            townID,
            roomPassword,
            togglePublicBox: true
          })
          await waitFor(() => expect(mockCreateTown)
            .toBeCalledWith({
              friendlyName: townName,
              isPubliclyListed: false,
              isMergeable: true
            }));

        });

        it('displays a toast "Town newTownName is ready to go!" when successful', async () => {
          const townID = nanoid();
          const roomPassword = nanoid();
          const townName = nanoid();
          await createTownWithOptions({
            townName,
            userName: nanoid(),
            townID,
            roomPassword,
            togglePublicBox: true
          })
          await waitFor(() => expect(mockCreateTown)
            .toBeCalledWith({
              friendlyName: townName,
              isPubliclyListed: false,
              isMergeable: true
            }));
          await waitFor(() => expect(mockToast)
            .toBeCalledWith(expect.objectContaining({
              title: `Town ${townName} is ready to go!`,
              status: 'success',
              isClosable: true,
              duration: null
            })));
        });
        it('after success, calls Video.setup, doLogin, and connect with the entered username and newly generated coveyTownID', async () => {
          const townID = nanoid();
          const roomPassword = nanoid();
          const userName = nanoid();
          const townName = nanoid();

          // Configure mocks
          mockVideoSetup.mockReset();
          const videoToken = nanoid();
          mockVideoSetup.mockReturnValue(Promise.resolve({ providerVideoToken: videoToken }))
          doLoginMock.mockReset();
          doLoginMock.mockReturnValue(Promise.resolve(true));

          // Create town
          await createTownWithOptions({
            townName,
            userName,
            townID,
            roomPassword,
            togglePublicBox: true
          })

          // Check for call sequence
          await waitFor(() => expect(mockVideoSetup)
            .toBeCalledWith(userName, townID));
          await waitFor(() => expect(doLoginMock)
            .toBeCalledWith({ providerVideoToken: videoToken }));
          await waitFor(() => expect(mockConnect)
            .toBeCalledWith(videoToken));

        });
        it('displays an error toast "Unable to connect to Towns Service" if an error occurs in createTown', async () => {
          const errorMessage = `Oops#${nanoid()}`;
          const townName = nanoid();
          await createTownWithOptions({
            townName,
            userName: nanoid(),
            errorMessage
          })
          await waitFor(() => expect(mockCreateTown)
            .toBeCalledWith({
              friendlyName: townName,
              isPubliclyListed: true,
              isMergeable: true
            }));
          await waitFor(() => expect(mockToast)
            .toBeCalledWith({
              title: 'Unable to connect to Towns Service',
              status: 'error',
              description: `Error: ${errorMessage}`
            }));
        });

      });
    });
  });

});

