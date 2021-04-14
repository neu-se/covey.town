/* eslint-disable no-await-in-loop,@typescript-eslint/no-loop-func,no-restricted-syntax */
import React from 'react'
import '@testing-library/jest-dom'
import { ChakraProvider } from '@chakra-ui/react'
import { fireEvent, render, RenderResult, waitFor, within } from '@testing-library/react'
import userEvent, { TargetElement } from '@testing-library/user-event'
import { nanoid } from 'nanoid';
import TownsServiceClient, { TownListResponse } from '../../classes/TownsServiceClient';
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
    townIDToMerge: '',
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
  let townIDToJoinField: HTMLInputElement;
  let userNameField: HTMLInputElement;
  let joinTownByIDButton: TargetElement;
  let expectedTowns: TownListResponse;

  beforeEach(async () => {
    jest.useFakeTimers();
    mocklistTowns.mockReset();
    doLoginMock.mockReset();
    mockConnect.mockReset();
    mockToast.mockReset();
    mockVideoSetup.mockReset();
    mockCreateTown.mockReset();

    const suffix = nanoid();
    expectedTowns = await listTowns(suffix);
    mocklistTowns.mockImplementation(() => listTowns(suffix));
    renderData = render(wrappedTownSelection());
    await waitFor(() => expect(renderData.getByText(`town1${suffix}`))
      .toBeInTheDocument());
    townIDToJoinField = renderData.getByPlaceholderText('ID of town to join, or select from list') as HTMLInputElement;
    userNameField = renderData.getByPlaceholderText('Your name') as HTMLInputElement;
    joinTownByIDButton = renderData.getByTestId('joinTownByIDButton');
  });
  describe('Part 2 - Joining existing towns', () => {

    describe('Joining an existing town by ID', () => {
      const joinTownWithOptions = async (params: { coveyTownID: string, userName: string }) => {
        fireEvent.change(userNameField, { target: { value: params.userName } });
        await waitFor(() => {
          expect(userNameField.value)
            .toBe(params.userName);
        });
        fireEvent.change(townIDToJoinField, { target: { value: params.coveyTownID } });
        await waitFor(() => expect(townIDToJoinField.value)
          .toBe(params.coveyTownID));
        userEvent.click(joinTownByIDButton);
      }

      it('includes a connect button, which calls Video.setup, doLogin, and connect with the entered username and coveyTownID (public town)', async () => {
        const coveyTownID = nanoid();
        const userName = nanoid();

        // Configure mocks
        mockVideoSetup.mockReset();
        const videoToken = nanoid();
        mockVideoSetup.mockReturnValue(Promise.resolve({ providerVideoToken: videoToken }))
        doLoginMock.mockReset();
        doLoginMock.mockReturnValue(Promise.resolve(true));

        await joinTownWithOptions({
          coveyTownID,
          userName
        });

        // Check for call sequence
        await waitFor(() => expect(mockVideoSetup)
          .toBeCalledWith(userName, coveyTownID, false));
        await waitFor(() => expect(doLoginMock)
          .toBeCalledWith({ providerVideoToken: videoToken }));
        await waitFor(() => expect(mockConnect)
          .toBeCalledWith(videoToken));

      });
      it('displays an error toast "Unable to join town" if the username is empty', async () => {
        const coveyTownID = nanoid();
        await joinTownWithOptions({
          coveyTownID,
          userName: ''
        });
        await waitFor(() => expect(mockToast)
          .toBeCalledWith({
            description: 'Please select a username',
            title: 'Unable to join town',
            status: 'error',
          }));
      });
      it('displays an error toast "Unable to join town" if the TownID is empty', async () => {
        const userName = nanoid();
        await joinTownWithOptions({
          coveyTownID: '',
          userName
        });
        await waitFor(() => expect(mockToast)
          .toBeCalledWith({
            description: 'Please enter a town ID',
            title: 'Unable to join town',
            status: 'error',
          }));
      });

      it('displays an error toast "Unable to connect to Towns Service" if an error occurs', async () => {
        const coveyTownID = nanoid();
        const userName = nanoid();
        const errorMessage = `Err${nanoid()}`;

        // Variant one: throw error in Video.setup

        // Configure mocks
        mockVideoSetup.mockReset();
        const videoToken = nanoid();
        mockVideoSetup.mockRejectedValue(new Error(errorMessage));
        doLoginMock.mockReset();
        doLoginMock.mockReturnValue(Promise.resolve(true));

        await joinTownWithOptions({
          coveyTownID,
          userName
        });

        // Check for call sequence
        await waitFor(() => expect(mockVideoSetup)
          .toBeCalledWith(userName, coveyTownID, false));
        await waitFor(() => expect(doLoginMock)
          .not
          .toBeCalledWith({ providerVideoToken: videoToken }));
        await waitFor(() => expect(mockConnect)
          .not
          .toBeCalledWith(videoToken));
        await waitFor(() => expect(mockToast)
          .toBeCalledWith({
            description: `Error: ${errorMessage}`,
            title: 'Unable to connect to Towns Service',
            status: 'error',
          }));

        // Variant two: throw error in doLogin

        // Configure mocks
        mockToast.mockReset();
        mockVideoSetup.mockReset();
        mockVideoSetup.mockReturnValue(Promise.resolve({ providerVideoToken: videoToken }))
        doLoginMock.mockReset();
        doLoginMock.mockRejectedValue(new Error(errorMessage));

        await joinTownWithOptions({
          coveyTownID,
          userName
        });

        // Check for call sequence
        await waitFor(() => expect(mockVideoSetup)
          .toBeCalledWith(userName, coveyTownID, false));
        await waitFor(() => expect(doLoginMock)
          .toBeCalledWith({ providerVideoToken: videoToken }));
        await waitFor(() => expect(mockConnect)
          .not
          .toBeCalledWith(videoToken));
        await waitFor(() => expect(mockToast)
          .toBeCalledWith({
            description: `Error: ${errorMessage}`,
            title: 'Unable to connect to Towns Service',
            status: 'error',
          }));

        // Variant three: throw error in connect

        // Configure mocks
        mockToast.mockReset();
        mockVideoSetup.mockReset();
        mockVideoSetup.mockReturnValue(Promise.resolve({ providerVideoToken: videoToken }))
        doLoginMock.mockReset();
        doLoginMock.mockReturnValue(Promise.resolve(true));
        mockConnect.mockRejectedValue(new Error(errorMessage));

        await joinTownWithOptions({
          coveyTownID,
          userName
        });

        // Check for call sequence
        await waitFor(() => expect(mockVideoSetup)
          .toBeCalledWith(userName, coveyTownID, false));
        await waitFor(() => expect(doLoginMock)
          .toBeCalledWith({ providerVideoToken: videoToken }));
        await waitFor(() => expect(mockConnect)
          .toBeCalledWith(videoToken));
        await waitFor(() => expect(mockToast)
          .toBeCalledWith({
            description: `Error: ${errorMessage}`,
            title: 'Unable to connect to Towns Service',
            status: 'error',
          }));

      });

    });
    describe('Joining an existing town from public town table', () => {

      it('includes a connect button in each row, which calls Video.setup, doLogin, and connect with the entered username and coveyTownID corresponding to that town', async () => {
        const rows = renderData.getAllByRole('row');
        for (const town of expectedTowns.towns) {
          if (town.currentOccupancy < town.maximumOccupancy) {
            mockVideoSetup.mockReset();
            const videoToken = nanoid();
            mockVideoSetup.mockReturnValue(Promise.resolve({ providerVideoToken: videoToken }))
            doLoginMock.mockReset();
            doLoginMock.mockReturnValue(Promise.resolve(true));
            const row = rows.find(each => within(each)
              .queryByText(town.coveyTownID));
            if (row) {
              const button = within(row)
                .getByRole('button');
              const username = nanoid();
              fireEvent.change(userNameField, { target: { value: username } });
              await waitFor(() => {
                expect(userNameField.value)
                  .toBe(username);
              });
              userEvent.click(button);
              await waitFor(() => expect(mockVideoSetup)
                .toBeCalledWith(username, town.coveyTownID, false));
              await waitFor(() => expect(doLoginMock)
                .toBeCalledWith({ providerVideoToken: videoToken }));
              await waitFor(() => expect(mockConnect)
                .toBeCalledWith(videoToken));
            } else {
              fail(`Could not find row for town ${town.coveyTownID}`);
            }
          }
        }
      });
      it('disables the connect button if room is at or over capacity', async () => {
        const rows = renderData.getAllByRole('row');
        for (const town of expectedTowns.towns) {
          if (town.currentOccupancy >= town.maximumOccupancy) {
            mockVideoSetup.mockReset();
            const row = rows.find(each => within(each)
              .queryByText(town.coveyTownID));
            if (row) {
              const button = within(row)
                .getByRole('button');
              const username = nanoid();
              fireEvent.change(userNameField, { target: { value: username } });
              await waitFor(() => {
                expect(userNameField.value)
                  .toBe(username);
              });
              userEvent.click(button);
              await waitFor(() => expect(mockVideoSetup)
                .not
                .toBeCalled());
            } else {
              fail(`Could not find row for town ${town.coveyTownID}`);
            }
          }
        }

      });
      it('displays an error toast "Unable to join town" if the username is empty', async () => {
        const rows = renderData.getAllByRole('row');
        for (const town of expectedTowns.towns) {
          if (town.currentOccupancy < town.maximumOccupancy) {
            mockVideoSetup.mockReset();
            const row = rows.find(each => within(each)
              .queryByText(town.coveyTownID));
            if (row) {
              const button = within(row)
                .getByRole('button');
              fireEvent.change(userNameField, { target: { value: '' } });
              await waitFor(() => {
                expect(userNameField.value)
                  .toBe('');
              });
              userEvent.click(button);
              await waitFor(() => expect(mockVideoSetup)
                .not
                .toBeCalled());
              await waitFor(() => expect(mockToast)
                .toBeCalledWith({
                  title: 'Unable to join town',
                  description: 'Please select a username',
                  status: 'error'
                }))
            } else {
              fail(`Could not find row for town ${town.coveyTownID}`);
            }
          }
        }
      });
      it('displays an error toast "Unable to connect to Towns Service" if an error occurs', async () => {
        const rows = renderData.getAllByRole('row');
        for (const town of expectedTowns.towns) {
          if (town.currentOccupancy < town.maximumOccupancy) {
            // Test an error from video.setup
            mockToast.mockReset();
            mockVideoSetup.mockReset();
            const errorMessage = `Random error #${nanoid()}`;
            mockVideoSetup.mockRejectedValue(new Error(errorMessage));
            const row = rows.find(each => within(each)
              .queryByText(town.coveyTownID));
            if (row) {
              const button = within(row)
                .getByRole('button');
              const username = nanoid();
              fireEvent.change(userNameField, { target: { value: username } });
              await waitFor(() => {
                expect(userNameField.value)
                  .toBe(username);
              });
              userEvent.click(button);
              await waitFor(() => expect(mockVideoSetup)
                .toBeCalled());
              await waitFor(() => expect(mockToast)
                .toBeCalledWith({
                  title: 'Unable to connect to Towns Service',
                  description: `Error: ${errorMessage}`,
                  status: 'error'
                }))

              // test an error from doLogin
              mockToast.mockReset();
              mockVideoSetup.mockReset();
              const videoToken = nanoid();
              mockVideoSetup.mockReturnValue(Promise.resolve({ providerVideoToken: videoToken }))
              doLoginMock.mockReset();
              doLoginMock.mockRejectedValue(new Error(errorMessage));

              fireEvent.change(userNameField, { target: { value: username } });
              await waitFor(() => {
                expect(userNameField.value)
                  .toBe(username);
              });
              userEvent.click(button);
              await waitFor(() => expect(mockVideoSetup)
                .toBeCalledWith(username, town.coveyTownID, false));
              await waitFor(() => expect(doLoginMock)
                .toBeCalledWith({ providerVideoToken: videoToken }));
              await waitFor(() => expect(mockToast)
                .toBeCalledWith({
                  title: 'Unable to connect to Towns Service',
                  description: `Error: ${errorMessage}`,
                  status: 'error'
                }))

              // test an error from connect
              mockToast.mockReset();
              mockVideoSetup.mockReset();
              mockVideoSetup.mockReturnValue(Promise.resolve({ providerVideoToken: videoToken }))
              doLoginMock.mockReset();
              doLoginMock.mockReturnValue(Promise.resolve(true));
              mockConnect.mockRejectedValue(new Error(errorMessage));

              fireEvent.change(userNameField, { target: { value: username } });
              await waitFor(() => {
                expect(userNameField.value)
                  .toBe(username);
              });
              userEvent.click(button);
              await waitFor(() => expect(mockVideoSetup)
                .toBeCalledWith(username, town.coveyTownID, false));
              await waitFor(() => expect(doLoginMock)
                .toBeCalledWith({ providerVideoToken: videoToken }));
              await waitFor(() => expect(mockConnect)
                .toBeCalledWith(videoToken));
              await waitFor(() => expect(mockToast)
                .toBeCalledWith({
                  title: 'Unable to connect to Towns Service',
                  description: `Error: ${errorMessage}`,
                  status: 'error'
                }))
            } else {
              fail(`Could not find row for town ${town.coveyTownID}`);
            }
          }
        }
      });
    });
  });
});

