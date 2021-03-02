/* eslint-disable no-await-in-loop,@typescript-eslint/no-loop-func,no-restricted-syntax */
import React from 'react'
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
  rooms: [
    {
      friendlyName: `room1${suffix}`,
      coveyRoomID: `1${suffix}`,
      currentOccupancy: 0,
      maximumOccupancy: 1,
    },
    {
      friendlyName: `room2${suffix}`,
      coveyRoomID: `2${suffix}`,
      currentOccupancy: 2,
      maximumOccupancy: 10,
    },
    {
      friendlyName: `room3${suffix}`,
      coveyRoomID: `3${suffix}`,
      currentOccupancy: 1,
      maximumOccupancy: 1,
    },
    {
      friendlyName: `room4${suffix}`,
      coveyRoomID: `4${suffix}`,
      currentOccupancy: 8,
      maximumOccupancy: 8,
    },
    {
      friendlyName: `room5${suffix}`,
      coveyRoomID: `5${suffix}`,
      currentOccupancy: 9,
      maximumOccupancy: 5,
    },
    {
      friendlyName: `room6${suffix}`,
      coveyRoomID: `6${suffix}`,
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

describe('Part 1 - Public room listing', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    mocklistTowns.mockReset();
  })
  it('is called when rendering (hopefully by a useeffect, this will be checked manually)', async () => {
    mocklistTowns.mockImplementation(() => listTowns(nanoid()));
    const renderData = render(wrappedTownSelection());
    await waitFor(() => {
      expect(mocklistTowns)
        .toBeCalledTimes(1);
    })
    renderData.unmount();
  });
  it('updates every 2000 msec', async () => {
    mocklistTowns.mockImplementation(() => listTowns(nanoid()));
    const renderData = render(wrappedTownSelection());
    await waitFor(() => {
      expect(mocklistTowns)
        .toBeCalledTimes(1);
    })
    jest.advanceTimersByTime(2000);
    await waitFor(() => {
      expect(mocklistTowns)
        .toBeCalledTimes(2);
    })
    jest.advanceTimersByTime(1000);
    await waitFor(() => {
      expect(mocklistTowns)
        .toBeCalledTimes(2);
    })
    renderData.unmount();
  });
  it('stops updating when unmounted', async () => {
    mocklistTowns.mockImplementation(() => listTowns(nanoid()));
    const renderData = render(wrappedTownSelection());
    await waitFor(() => {
      expect(mocklistTowns)
        .toBeCalledTimes(1);
    })
    jest.advanceTimersByTime(2000);
    await waitFor(() => {
      expect(mocklistTowns)
        .toBeCalledTimes(2);
    })
    renderData.unmount();
    jest.advanceTimersByTime(10000);
    await waitFor(() => {
      expect(mocklistTowns)
        .toBeCalledTimes(2);
    })
  });
  it('updates the page with all rooms stored in currentPublicTowns', async () => {
    const suffix1 = nanoid();
    const suffix2 = nanoid();
    const expectedTowns1 = await listTowns(suffix1)
    const expectedTowns2 = await listTowns(suffix2)
    mocklistTowns.mockImplementation(() => listTowns(suffix1));
    const renderData = render(wrappedTownSelection());
    await waitFor(() => {
      expectedTowns1.rooms.map((town) => expect(renderData.getByText(town.friendlyName))
        .toBeInTheDocument());
    })
    mocklistTowns.mockImplementation(() => listTowns(suffix2));
    jest.advanceTimersByTime(2000);
    await waitFor(() => {
      expectedTowns2.rooms.forEach((town) => expect(renderData.getByText(town.friendlyName))
        .toBeInTheDocument());
      expectedTowns1.rooms.forEach((town) => expect(renderData.queryByText(town.friendlyName))
        .not
        .toBeInTheDocument());
    })

  });
  it('does not include the hardcoded demo in the listing', async () => {
    const suffix = nanoid();
    const expectedTowns1 = await listTowns(suffix)
    mocklistTowns.mockImplementation(() => listTowns(suffix));
    const renderData = render(wrappedTownSelection());
    await waitFor(() => {
      expectedTowns1.rooms.map((town) => expect(renderData.getByText(town.friendlyName))
        .toBeInTheDocument());
    })
    expect(renderData.queryByText('demoTownName'))
      .not
      .toBeInTheDocument();
  });
  it('sorts rooms by occupancy descending', async () => {
    const suffix1 = nanoid();
    const suffix2 = nanoid();
    const expectedTowns1 = await listTowns(suffix1)
    expectedTowns1.rooms = expectedTowns1.rooms.sort((a, b) => b.currentOccupancy - a.currentOccupancy);

    const expectedTowns2 = await listTowns(suffix2)
    expectedTowns2.rooms = expectedTowns2.rooms.sort((a, b) => b.currentOccupancy - a.currentOccupancy);

    mocklistTowns.mockImplementation(() => listTowns(suffix1));
    const renderData = render(wrappedTownSelection());
    await waitFor(() => {
      expectedTowns1.rooms.map((town) => expect(renderData.getByText(town.friendlyName))
        .toBeInTheDocument());
    })
    // All rooms are in doc, now make sure they are sorted by occupancy
    let rows = renderData.getAllByRole('row');
    for (let i = 1; i < rows.length; i += 1) { // off-by-one for the header row
      // console.log(rows[i]);
      const existing = within(rows[i])
        .getByText(expectedTowns1.rooms[i - 1].friendlyName);
      expect(existing)
        .toBeInTheDocument();
      for (let j = 0; j < expectedTowns1.rooms.length; j += 1) {
        if (j !== i - 1) {
          expect(within(rows[i])
            .queryByText(expectedTowns1.rooms[j].friendlyName))
            .not
            .toBeInTheDocument();
        }
      }
    }
    // Now, do that all again to make sure it sorts EVERY run
    mocklistTowns.mockImplementation(() => listTowns(suffix2));
    jest.advanceTimersByTime(2000);
    await waitFor(() =>
      expectedTowns2.rooms.map((town) => expect(renderData.getByText(town.friendlyName))
        .toBeInTheDocument())
    )

    // All rooms are in doc, now make sure they are sorted by occupancy
    rows = renderData.getAllByRole('row');
    for (let i = 1; i < rows.length; i += 1) { // off-by-one for the header row
      // console.log(rows[i]);
      const existing = within(rows[i])
        .getByText(expectedTowns2.rooms[i - 1].friendlyName);
      expect(existing)
        .toBeInTheDocument();
      for (let j = 0; j < expectedTowns2.rooms.length; j += 1) {
        if (j !== i - 1) {
          expect(within(rows[i])
            .queryByText(expectedTowns2.rooms[j].friendlyName))
            .not
            .toBeInTheDocument();
        }
      }
    }
  });
  it('represents each row in the table as specified', async () => {
    const suffix1 = nanoid();
    const expectedTowns = await listTowns(suffix1);
    expectedTowns.rooms = expectedTowns.rooms.sort((a, b) => b.currentOccupancy - a.currentOccupancy);
    mocklistTowns.mockImplementation(() => listTowns(suffix1));
    const renderData = render(wrappedTownSelection());
    await waitFor(() => {
      expectedTowns.rooms.forEach((town) => expect(renderData.getByText(town.friendlyName))
        .toBeInTheDocument());
    })
    const rows = renderData.getAllByRole('row');
    expectedTowns.rooms.forEach((town) => {
      const row = rows.find(each => within(each)
        .queryByText(town.coveyRoomID));
      if (row) {
        const cells = within(row)
          .queryAllByRole('cell');
        // Cell order: friendlyName, roomID, occupancy/join + button
        expect(cells.length)
          .toBe(3);
        expect(within(cells[0])
          .queryByText(town.friendlyName))
          .toBeInTheDocument();
        expect(within(cells[1])
          .queryByText(town.coveyRoomID))
          .toBeInTheDocument();
        expect(within(cells[2])
          .queryByText(`${town.currentOccupancy}/${town.maximumOccupancy}`))
          .toBeInTheDocument();
      } else {
        fail(`Could not find row for town ${town.coveyRoomID}`);
      }
    })
  });
});

describe('Town Selection - depends on Part 1 passing', () => {
  let renderData: RenderResult<typeof import("@testing-library/dom/types/queries")>;
  let townIDToJoinField: HTMLInputElement;
  let newTownNameField: HTMLInputElement;
  let newTownIsPublicCheckbox: HTMLInputElement;
  let userNameField: HTMLInputElement;
  let newTownButton: TargetElement;
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
    await waitFor(() => expect(renderData.getByText(`room1${suffix}`))
      .toBeInTheDocument());
    newTownIsPublicCheckbox = renderData.getByLabelText('Publicly Listed') as HTMLInputElement;
    townIDToJoinField = renderData.getByPlaceholderText('ID of town to join, or select from list') as HTMLInputElement;
    newTownNameField = renderData.getByPlaceholderText('New Town Name') as HTMLInputElement;
    userNameField = renderData.getByPlaceholderText('Your name') as HTMLInputElement;
    newTownButton = renderData.getByTestId('newTownButton');
    joinTownByIDButton = renderData.getByTestId('joinTownByIDButton');
  });
  describe('Part 2 - Joining existing towns', () => {

    describe('Joining an existing town by ID', () => {
      const joinTownWithOptions = async (params: { coveyRoomID: string, userName: string }) => {
        fireEvent.change(userNameField, { target: { value: params.userName } });
        await waitFor(() => {
          expect(userNameField.value)
            .toBe(params.userName);
        });
        fireEvent.change(townIDToJoinField, { target: { value: params.coveyRoomID } });
        await waitFor(() => expect(townIDToJoinField.value)
          .toBe(params.coveyRoomID));
        userEvent.click(joinTownByIDButton);
      }

      it('includes a connect button, which calls Video.setup, doLogin, and connect with the entered username and coveyRoomID (public town)', async () => {
        const coveyRoomID = nanoid();
        const userName = nanoid();

        // Configure mocks
        mockVideoSetup.mockReset();
        const videoToken = nanoid();
        mockVideoSetup.mockReturnValue(Promise.resolve({ providerVideoToken: videoToken }))
        doLoginMock.mockReset();
        doLoginMock.mockReturnValue(Promise.resolve(true));

        await joinTownWithOptions({
          coveyRoomID,
          userName
        });

        // Check for call sequence
        await waitFor(() => expect(mockVideoSetup)
          .toBeCalledWith(userName, coveyRoomID));
        await waitFor(() => expect(doLoginMock)
          .toBeCalledWith({ providerVideoToken: videoToken }));
        await waitFor(() => expect(mockConnect)
          .toBeCalledWith(videoToken));

      });
      it('displays an error toast "Unable to join town" if the username is empty', async () => {
        const coveyRoomID = nanoid();
        await joinTownWithOptions({
          coveyRoomID,
          userName: ''
        });
        await waitFor(() => expect(mockToast)
          .toBeCalledWith({
            description: 'Please select a username',
            title: 'Unable to join town',
            status: 'error',
          }));
      });
      it('displays an error toast "Unable to join town" if the roomID is empty', async () => {
        const userName = nanoid();
        await joinTownWithOptions({
          coveyRoomID: '',
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
        const coveyRoomID = nanoid();
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
          coveyRoomID,
          userName
        });

        // Check for call sequence
        await waitFor(() => expect(mockVideoSetup)
          .toBeCalledWith(userName, coveyRoomID));
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
          coveyRoomID,
          userName
        });

        // Check for call sequence
        await waitFor(() => expect(mockVideoSetup)
          .toBeCalledWith(userName, coveyRoomID));
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
          coveyRoomID,
          userName
        });

        // Check for call sequence
        await waitFor(() => expect(mockVideoSetup)
          .toBeCalledWith(userName, coveyRoomID));
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

      it('includes a connect button in each row, which calls Video.setup, doLogin, and connect with the entered username and coveyRoomID corresponding to that town', async () => {
        const rows = renderData.getAllByRole('row');
        for (const town of expectedTowns.rooms) {
          if (town.currentOccupancy < town.maximumOccupancy) {
            mockVideoSetup.mockReset();
            const videoToken = nanoid();
            mockVideoSetup.mockReturnValue(Promise.resolve({ providerVideoToken: videoToken }))
            doLoginMock.mockReset();
            doLoginMock.mockReturnValue(Promise.resolve(true));
            const row = rows.find(each => within(each)
              .queryByText(town.coveyRoomID));
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
                .toBeCalledWith(username, town.coveyRoomID));
              await waitFor(() => expect(doLoginMock)
                .toBeCalledWith({ providerVideoToken: videoToken }));
              await waitFor(() => expect(mockConnect)
                .toBeCalledWith(videoToken));
            } else {
              fail(`Could not find row for town ${town.coveyRoomID}`);
            }
          }
        }
      });
      it('disables the connect button if room is at or over capacity', async () => {
        const rows = renderData.getAllByRole('row');
        for (const town of expectedTowns.rooms) {
          if (town.currentOccupancy >= town.maximumOccupancy) {
            mockVideoSetup.mockReset();
            const row = rows.find(each => within(each)
              .queryByText(town.coveyRoomID));
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
              fail(`Could not find row for town ${town.coveyRoomID}`);
            }
          }
        }

      });
      it('displays an error toast "Unable to join town" if the username is empty', async () => {
        const rows = renderData.getAllByRole('row');
        for (const town of expectedTowns.rooms) {
          if (town.currentOccupancy < town.maximumOccupancy) {
            mockVideoSetup.mockReset();
            const row = rows.find(each => within(each)
              .queryByText(town.coveyRoomID));
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
              fail(`Could not find row for town ${town.coveyRoomID}`);
            }
          }
        }
      });
      it('displays an error toast "Unable to connect to Towns Service" if an error occurs', async () => {
        const rows = renderData.getAllByRole('row');
        for (const town of expectedTowns.rooms) {
          if (town.currentOccupancy < town.maximumOccupancy) {
            // Test an error from video.setup
            mockToast.mockReset();
            mockVideoSetup.mockReset();
            const errorMessage = `Random error #${nanoid()}`;
            mockVideoSetup.mockRejectedValue(new Error(errorMessage));
            const row = rows.find(each => within(each)
              .queryByText(town.coveyRoomID));
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
                .toBeCalledWith(username, town.coveyRoomID));
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
                .toBeCalledWith(username, town.coveyRoomID));
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
              fail(`Could not find row for town ${town.coveyRoomID}`);
            }
          }
        }
      });
    });
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
          coveyRoomID: params.townID,
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
              isPubliclyListed: true
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
              isPubliclyListed: false
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
              isPubliclyListed: false
            }));
          await waitFor(() => expect(mockToast)
            .toBeCalledWith(expect.objectContaining({
              title: `Town ${townName} is ready to go!`,
              status: 'success',
              isClosable: true,
              duration: null
            })));
        });
        it('after success, calls Video.setup, doLogin, and connect with the entered username and newly generated coveyRoomID', async () => {
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
              isPubliclyListed: true
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

