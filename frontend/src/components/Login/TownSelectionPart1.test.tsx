/* eslint-disable no-await-in-loop,@typescript-eslint/no-loop-func,no-restricted-syntax */
import React from 'react'
import '@testing-library/jest-dom'
import { ChakraProvider } from '@chakra-ui/react'
import { render, waitFor, within } from '@testing-library/react'
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
    townIDToMerge: '',
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

describe('Part 1 - Public room listing', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    mocklistTowns.mockReset();
  })
  it('is called when rendering (hopefully by a useeffect, this will be checked manually)', async () => {
    jest.useRealTimers();
    mocklistTowns.mockImplementation(() => listTowns(nanoid()));
    const renderData = render(wrappedTownSelection());
    await waitFor(() => {
      expect(mocklistTowns)
        .toHaveBeenCalledTimes(1);
    }, {timeout: 200})
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
  it('updates the page with all towns stored in currentPublicTowns', async () => {
    const suffix1 = nanoid();
    const suffix2 = nanoid();
    const expectedTowns1 = await listTowns(suffix1)
    const expectedTowns2 = await listTowns(suffix2)
    mocklistTowns.mockImplementation(() => listTowns(suffix1));
    const renderData = render(wrappedTownSelection());
    await waitFor(() => {
      expectedTowns1.towns.map((town) => expect(renderData.getByText(town.friendlyName))
        .toBeInTheDocument());
    })
    mocklistTowns.mockImplementation(() => listTowns(suffix2));
    jest.advanceTimersByTime(2000);
    await waitFor(() => {
      expectedTowns2.towns.forEach((town) => expect(renderData.getByText(town.friendlyName))
        .toBeInTheDocument());
      expectedTowns1.towns.forEach((town) => expect(renderData.queryByText(town.friendlyName))
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
      expectedTowns1.towns.map((town) => expect(renderData.getByText(town.friendlyName))
        .toBeInTheDocument());
    })
    expect(renderData.queryByText('demoTownName'))
      .not
      .toBeInTheDocument();
  });
  it('sorts towns by occupancy descending', async () => {
    const suffix1 = nanoid();
    const suffix2 = nanoid();
    const expectedTowns1 = await listTowns(suffix1)
    expectedTowns1.towns = expectedTowns1.towns.sort((a, b) => b.currentOccupancy - a.currentOccupancy);

    const expectedTowns2 = await listTowns(suffix2)
    expectedTowns2.towns = expectedTowns2.towns.sort((a, b) => b.currentOccupancy - a.currentOccupancy);

    mocklistTowns.mockImplementation(() => listTowns(suffix1));
    const renderData = render(wrappedTownSelection());
    await waitFor(() => {
      expectedTowns1.towns.map((town) => expect(renderData.getByText(town.friendlyName))
        .toBeInTheDocument());
    })
    // All towns are in doc, now make sure they are sorted by occupancy
    let rows = renderData.getAllByRole('row');
    for (let i = 1; i < rows.length; i += 1) { // off-by-one for the header row
      // console.log(rows[i]);
      const existing = within(rows[i])
        .getByText(expectedTowns1.towns[i - 1].friendlyName);
      expect(existing)
        .toBeInTheDocument();
      for (let j = 0; j < expectedTowns1.towns.length; j += 1) {
        if (j !== i - 1) {
          expect(within(rows[i])
            .queryByText(expectedTowns1.towns[j].friendlyName))
            .not
            .toBeInTheDocument();
        }
      }
    }
    // Now, do that all again to make sure it sorts EVERY run
    mocklistTowns.mockImplementation(() => listTowns(suffix2));
    jest.advanceTimersByTime(2000);
    await waitFor(() =>
      expectedTowns2.towns.map((town) => expect(renderData.getByText(town.friendlyName))
        .toBeInTheDocument())
    )

    // All towns are in doc, now make sure they are sorted by occupancy
    rows = renderData.getAllByRole('row');
    for (let i = 1; i < rows.length; i += 1) { // off-by-one for the header row
      // console.log(rows[i]);
      const existing = within(rows[i])
        .getByText(expectedTowns2.towns[i - 1].friendlyName);
      expect(existing)
        .toBeInTheDocument();
      for (let j = 0; j < expectedTowns2.towns.length; j += 1) {
        if (j !== i - 1) {
          expect(within(rows[i])
            .queryByText(expectedTowns2.towns[j].friendlyName))
            .not
            .toBeInTheDocument();
        }
      }
    }
  });
  it('represents each row in the table as specified', async () => {
    const suffix1 = nanoid();
    const expectedTowns = await listTowns(suffix1);
    expectedTowns.towns = expectedTowns.towns.sort((a, b) => b.currentOccupancy - a.currentOccupancy);
    mocklistTowns.mockImplementation(() => listTowns(suffix1));
    const renderData = render(wrappedTownSelection());
    await waitFor(() => {
      expectedTowns.towns.forEach((town) => expect(renderData.getByText(town.friendlyName))
        .toBeInTheDocument());
    })
    const rows = renderData.getAllByRole('row');
    expectedTowns.towns.forEach((town) => {
      const row = rows.find(each => within(each)
        .queryByText(town.coveyTownID));
      if (row) {
        const cells = within(row)
          .queryAllByRole('cell');
        // Cell order: friendlyName, TownID, occupancy/join + button
        expect(cells.length)
          .toBe(3);
        expect(within(cells[0])
          .queryByText(town.friendlyName))
          .toBeInTheDocument();
        expect(within(cells[1])
          .queryByText(town.coveyTownID))
          .toBeInTheDocument();
        expect(within(cells[2])
          .queryByText(`${town.currentOccupancy}/${town.maximumOccupancy}`))
          .toBeInTheDocument();
      } else {
        fail(`Could not find row for town ${town.coveyTownID}`);
      }
    })
  });
});

