/* eslint-disable @typescript-eslint/ban-ts-comment */
import { ChakraProvider } from '@chakra-ui/react';
import React from 'react';
import '@testing-library/jest-dom'
import { fireEvent, render, RenderResult, waitFor } from '@testing-library/react';
import { nanoid } from 'nanoid';
import { TargetElement } from '@testing-library/user-event';
import TownSettings from './TownSettings';
import TownsServiceClient from '../../classes/TownsServiceClient';
import CoveyAppContext from '../../contexts/CoveyAppContext';

const mockUseCoveyAppState = jest.fn(() => (Promise.resolve()));
const mockToast = jest.fn();
const mockUseDisclosure = {isOpen: true, onOpen: jest.fn(), onClose: jest.fn()};

jest.mock('../../classes/TownsServiceClient');
jest.mock('../../hooks/useCoveyAppState', () => ({
  __esModule: true, // this property makes it work
  default: () => (mockUseCoveyAppState)
}));
jest.mock("@chakra-ui/react", () => {
  const ui = jest.requireActual("@chakra-ui/react");
  return {
    ...ui,
    useToast: ()=>(mockToast),
    useDisclosure: ()=>(mockUseDisclosure),
  };
})
const mockUpdateTown = jest.fn();
const mockDeleteTown = jest.fn();
TownsServiceClient.prototype.updateTown = mockUpdateTown;
TownsServiceClient.prototype.deleteTown = mockDeleteTown;
// @ts-ignore
mockUseCoveyAppState.apiClient = new TownsServiceClient();

function wrappedTownSettings() {
  return <ChakraProvider><CoveyAppContext.Provider value={{
    nearbyPlayers: { nearbyPlayers: [] },
    players: [],
    myPlayerID: '',
    townIDToMerge: '',
    currentTownID: '',
    currentTownFriendlyName: '',
    currentTownIsPubliclyListed: false,
    currentTownIsMergeable: false,
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
    <TownSettings/></CoveyAppContext.Provider></ChakraProvider>;
}

describe('Part 4 - Town Settings', () => {
  let renderData: RenderResult;
  let friendlyNameField: HTMLInputElement;
  let passwordField: HTMLInputElement
  let isPublicCheck: HTMLInputElement;
  let isMergeableCheck: HTMLInputElement;
  let deleteButton: TargetElement;
  let updateButton: TargetElement;

  const openSettingsPane = async (params: { friendlyName: string, isPubliclyListed: boolean, isMergeable: boolean, townID: string }) => {
    // @ts-ignore
    mockUseCoveyAppState.currentTownID = params.townID;
    // @ts-ignore
    mockUseCoveyAppState.currentTownFriendlyName = params.friendlyName;
    // @ts-ignore
    mockUseCoveyAppState.currentTownIsPubliclyListed = params.isPubliclyListed;
    renderData = render(wrappedTownSettings());
    // const openMenuButton = renderData.getByTestId('openMenuButton');
    // fireEvent.click(openMenuButton);
    await waitFor(() => (renderData.getByText('Friendly Name')));
    friendlyNameField = renderData.getByLabelText('Friendly Name') as HTMLInputElement;
    passwordField = renderData.getByTestId('updatePassword') as HTMLInputElement;
    isPublicCheck = renderData.getByLabelText('Publicly Listed') as HTMLInputElement;
    isMergeableCheck = renderData.getByLabelText('Mergeable?') as HTMLInputElement;
    deleteButton = renderData.getByTestId('deletebutton');
    updateButton = renderData.getByTestId('updatebutton');
  }
  beforeEach(async () => {
    mockUpdateTown.mockReset();
    mockDeleteTown.mockReset();
    mockUseDisclosure.onClose.mockReset();
  });
  it("Loads the default form values from the current app state", async () => {
    let params = {
      friendlyName: nanoid(),
      isPubliclyListed: true,
      isMergeable: false,
      townID: nanoid(),
    }
    await openSettingsPane(params);
    await waitFor(() => expect(renderData.getByText(`Edit town ${params.friendlyName} (${params.townID})`))
      .toBeInTheDocument());
    await waitFor(() => expect(friendlyNameField.value)
      .toBe(params.friendlyName));
    await waitFor(() => expect(isPublicCheck.checked)
      .toBe(true));
    await waitFor(() => expect(isMergeableCheck.checked)
    .toBe(false));
    renderData.unmount();

    params = {
      friendlyName: nanoid(),
      isPubliclyListed: false,
      isMergeable: false,
      townID: nanoid(),
    }
    await openSettingsPane(params);
    await waitFor(() => expect(renderData.getByText(`Edit town ${params.friendlyName} (${params.townID})`))
      .toBeInTheDocument());
    await waitFor(() => expect(friendlyNameField.value)
      .toBe(params.friendlyName));
    await waitFor(() => expect(isPublicCheck.checked)
      .toBe(false));
    await waitFor(() => expect(isMergeableCheck.checked).toBe(false));
    renderData.unmount();
  });
  describe("Updating a town", () => {
    it("Passes the form values to apiClient.updateTown", async () => {
      const params = {
        friendlyName: nanoid(),
        isPubliclyListed: false,
        isMergeable: false,
        townID: nanoid(),
      }
      await openSettingsPane(params);

      const coveyTownPassword = nanoid();
      const friendlyName = nanoid();
      fireEvent.change(friendlyNameField, { target: { value: friendlyName } });
      await waitFor(() => expect(friendlyNameField.value)
        .toBe(friendlyName));
      fireEvent.change(passwordField, { target: { value: coveyTownPassword } });
      await waitFor(() => expect(passwordField.value)
        .toBe(coveyTownPassword));
      fireEvent.click(isPublicCheck);
      await waitFor(() => expect(isPublicCheck.checked)
        .toBe(true));
      fireEvent.click(updateButton);
      await waitFor(() => expect(mockUpdateTown)
        .toBeCalledWith({
          coveyTownID: params.townID,
          coveyTownPassword,
          friendlyName,
          isPubliclyListed: true
        }));
      expect(mockDeleteTown).not.toBeCalled();

    });
    it("Displays a toast 'Town updated' and closes on successful update", async () => {
      const params = {
        friendlyName: nanoid(),
        isPubliclyListed: false,
        isMergeable: false,
        townID: nanoid(),
      }

      mockUpdateTown.mockReturnValue(Promise.resolve());

      await openSettingsPane(params);

      const coveyTownPassword = nanoid();
      const friendlyName = nanoid();
      fireEvent.change(friendlyNameField, { target: { value: friendlyName } });
      await waitFor(() => expect(friendlyNameField.value)
        .toBe(friendlyName));
      fireEvent.change(passwordField, { target: { value: coveyTownPassword } });
      await waitFor(() => expect(passwordField.value)
        .toBe(coveyTownPassword));
      fireEvent.click(updateButton);

      await waitFor(() => expect(mockToast)
        .toBeCalledWith({
          title: 'Town updated',
          description: 'To see the updated town, please exit and re-join this town',
          status: 'success'
        }));
      expect(mockDeleteTown).not.toBeCalled();

      await waitFor(()=>expect(mockUseDisclosure.onClose).toBeCalled());
    });
    it("Displays a toast 'Unable to update town' if an error is thrown by apiClient.updateTown", async () => {
      const params = {
        friendlyName: nanoid(),
        isPubliclyListed: false,
        isMergeable: false,
        townID: nanoid(),
      }

      const message = `Error${nanoid()}`;
      mockUpdateTown.mockRejectedValue(new Error(message));

      await openSettingsPane(params);

      const coveyTownPassword = nanoid();
      const friendlyName = nanoid();
      fireEvent.change(friendlyNameField, { target: { value: friendlyName } });
      await waitFor(() => expect(friendlyNameField.value)
        .toBe(friendlyName));
      fireEvent.change(passwordField, { target: { value: coveyTownPassword } });
      await waitFor(() => expect(passwordField.value)
        .toBe(coveyTownPassword));
      fireEvent.click(updateButton);

      await waitFor(() => expect(mockToast)
        .toBeCalledWith({
          title: 'Unable to update town',
          description: `Error: ${message}`,
          status: 'error'
        }));

      expect(mockDeleteTown).not.toBeCalled();

    });
  });
  describe("Deleting a town", () => {
    it("Passes the form values to apiClient.deleteTown", async () => {
      const params = {
        friendlyName: nanoid(),
        isPubliclyListed: true,
        isMergeable: true,
        townID: nanoid(),
      }
      await openSettingsPane(params);

      const coveyTownPassword = nanoid();
      const friendlyName = nanoid();
      fireEvent.change(friendlyNameField, { target: { value: friendlyName } });
      await waitFor(() => expect(friendlyNameField.value)
        .toBe(friendlyName));
      fireEvent.change(passwordField, { target: { value: coveyTownPassword } });
      await waitFor(() => expect(passwordField.value)
        .toBe(coveyTownPassword));
      fireEvent.click(isPublicCheck);
      await waitFor(() => expect(isPublicCheck.checked)
        .toBe(false));
      fireEvent.click(deleteButton);
      await waitFor(() => expect(mockDeleteTown)
        .toBeCalledWith({
          coveyTownID: params.townID,
          coveyTownPassword,
        }));
      expect(mockUpdateTown).not.toBeCalled();

    });
    it("Displays a toast 'Town deleted' and closes on successful update", async () => {
      const params = {
        friendlyName: nanoid(),
        isPubliclyListed: true,
        isMergeable: true,
        townID: nanoid(),
      }
      mockDeleteTown.mockReturnValue(Promise.resolve());

      await openSettingsPane(params);

      const coveyTownPassword = nanoid();
      fireEvent.change(passwordField, { target: { value: coveyTownPassword } });
      await waitFor(() => expect(passwordField.value)
        .toBe(coveyTownPassword));
      fireEvent.click(deleteButton);
      await waitFor(() => expect(mockDeleteTown)
        .toBeCalledWith({
          coveyTownID: params.townID,
          coveyTownPassword,
        }));

      await waitFor(() => expect(mockToast)
        .toBeCalledWith({
          title: 'Town deleted',
          status: 'success'
        }));
      expect(mockUpdateTown).not.toBeCalled();
      await waitFor(()=>expect(mockUseDisclosure.onClose).toBeCalled());

    });
    it("Displays a toast 'Unable to delete town' if an error is thrown by apiClient.deleteTown", async () => {
      const params = {
        friendlyName: nanoid(),
        isPubliclyListed: false,
        isMergeable: false,
        townID: nanoid(),
      }

      const message = `Error${nanoid()}`;
      mockDeleteTown.mockRejectedValue(new Error(message));

      await openSettingsPane(params);

      const coveyTownPassword = nanoid();
      fireEvent.change(passwordField, { target: { value: coveyTownPassword } });
      await waitFor(() => expect(passwordField.value)
        .toBe(coveyTownPassword));
      fireEvent.click(deleteButton);

      await waitFor(() => expect(mockToast)
        .toBeCalledWith({
          title: 'Unable to delete town',
          description: `Error: ${message}`,
          status: 'error'
        }));

      expect(mockUpdateTown).not.toBeCalled();

    });
  });
})
