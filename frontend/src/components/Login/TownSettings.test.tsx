import { UseDisclosureReturn, ChakraProvider } from '@chakra-ui/react';
import React from 'react';
import '@testing-library/jest-dom';
import { fireEvent, render, RenderResult, waitFor } from '@testing-library/react';
import { nanoid } from 'nanoid';
import TownSettings from './TownSettings';
import TownController from '../../classes/TownController';
import { mock, mockClear, MockProxy } from 'jest-mock-extended';
import { mockTownController } from '../../TestUtils';
import TownControllerContext from '../../contexts/TownControllerContext';

const mockToast = jest.fn();
const mockUseDisclosure = mock<UseDisclosureReturn>();
mockUseDisclosure.isOpen = true;

jest.mock('@chakra-ui/react', () => {
  const ui = jest.requireActual('@chakra-ui/react');
  return {
    ...ui,
    useToast: () => mockToast,
    useDisclosure: () => {
      return mockUseDisclosure;
    },
  };
});

describe('Town Settings Panel', () => {
  let renderData: RenderResult;
  let friendlyNameField: HTMLInputElement;
  let passwordField: HTMLInputElement;
  let isPublicCheck: HTMLInputElement;
  let deleteButton: HTMLElement;
  let updateButton: HTMLElement;
  let mockedTownController: MockProxy<TownController>;

  const openSettingsPane = async (params: {
    friendlyName: string;
    isPubliclyListed: boolean;
    townID: string;
  }) => {
    mockedTownController = mockTownController({
      friendlyName: params.friendlyName,
      townID: params.townID,
      townIsPubliclyListed: params.isPubliclyListed,
    });

    renderData = render(
      <ChakraProvider>
        <TownControllerContext.Provider value={mockedTownController}>
          <TownSettings />
        </TownControllerContext.Provider>
      </ChakraProvider>,
    );

    await waitFor(() => renderData.getByText('Friendly Name'));
    friendlyNameField = renderData.getByLabelText('Friendly Name') as HTMLInputElement;
    passwordField = renderData.getByTestId('updatePassword') as HTMLInputElement;
    isPublicCheck = renderData.getByLabelText('Publicly Listed') as HTMLInputElement;
    deleteButton = renderData.getByTestId('deletebutton');
    updateButton = renderData.getByTestId('updatebutton');
  };

  beforeEach(async () => {
    mockUseDisclosure.onClose.mockReset();
    mockClear(mockToast);
  });
  it('Loads the default form values from the current app state', async () => {
    let params = {
      friendlyName: nanoid(),
      isPubliclyListed: true,
      townID: nanoid(),
    };
    await openSettingsPane(params);
    await waitFor(() =>
      expect(
        renderData.getByText(`Edit town ${params.friendlyName} (${params.townID})`),
      ).toBeInTheDocument(),
    );
    await waitFor(() => expect(friendlyNameField.value).toBe(params.friendlyName));
    await waitFor(() => expect(isPublicCheck.checked).toBe(true));
    renderData.unmount();

    params = {
      friendlyName: nanoid(),
      isPubliclyListed: false,
      townID: nanoid(),
    };
    await openSettingsPane(params);
    await waitFor(() =>
      expect(
        renderData.getByText(`Edit town ${params.friendlyName} (${params.townID})`),
      ).toBeInTheDocument(),
    );
    await waitFor(() => expect(friendlyNameField.value).toBe(params.friendlyName));
    await waitFor(() => expect(isPublicCheck.checked).toBe(false));
    renderData.unmount();
  }, 10000);
  describe('Updating a town', () => {
    it('Passes the form values to apiClient.updateTown', async () => {
      const params = {
        friendlyName: nanoid(),
        isPubliclyListed: false,
        townID: nanoid(),
      };
      await openSettingsPane(params);

      const coveyTownPassword = nanoid();
      const friendlyName = nanoid();
      fireEvent.change(friendlyNameField, { target: { value: friendlyName } });
      await waitFor(() => expect(friendlyNameField.value).toBe(friendlyName));
      fireEvent.change(passwordField, { target: { value: coveyTownPassword } });
      await waitFor(() => expect(passwordField.value).toBe(coveyTownPassword));
      fireEvent.click(isPublicCheck);
      await waitFor(() => expect(isPublicCheck.checked).toBe(true));
      fireEvent.click(updateButton);
      await waitFor(() =>
        expect(mockedTownController.updateTown).toBeCalledWith(coveyTownPassword, {
          friendlyName,
          isPubliclyListed: true,
        }),
      );
      expect(mockedTownController.deleteTown).not.toBeCalled();
    }, 10000);
    it("Displays a toast 'Town updated' and closes on successful update", async () => {
      const params = {
        friendlyName: nanoid(),
        isPubliclyListed: false,
        townID: nanoid(),
      };

      await openSettingsPane(params);

      const coveyTownPassword = nanoid();
      const friendlyName = nanoid();
      fireEvent.change(friendlyNameField, { target: { value: friendlyName } });
      await waitFor(() => expect(friendlyNameField.value).toBe(friendlyName));
      fireEvent.change(passwordField, { target: { value: coveyTownPassword } });
      await waitFor(() => expect(passwordField.value).toBe(coveyTownPassword));
      fireEvent.click(updateButton);

      await waitFor(() =>
        expect(mockToast).toBeCalledWith({
          title: 'Town updated',
          description: 'To see the updated town, please exit and re-join this town',
          status: 'success',
        }),
      );
      expect(mockedTownController.deleteTown).not.toBeCalled();

      await waitFor(() => expect(mockUseDisclosure.onClose).toBeCalled());
    }, 10000);
    it("Displays a toast 'Unable to update town' if an error is thrown by updateTown", async () => {
      const params = {
        friendlyName: nanoid(),
        isPubliclyListed: false,
        townID: nanoid(),
      };

      await openSettingsPane(params);

      const message = `Error${nanoid()}`;
      mockedTownController.updateTown.mockRejectedValue(new Error(message));

      const coveyTownPassword = nanoid();
      const friendlyName = nanoid();
      fireEvent.change(friendlyNameField, { target: { value: friendlyName } });
      await waitFor(() => expect(friendlyNameField.value).toBe(friendlyName));
      fireEvent.change(passwordField, { target: { value: coveyTownPassword } });
      await waitFor(() => expect(passwordField.value).toBe(coveyTownPassword));
      fireEvent.click(updateButton);

      await waitFor(() =>
        expect(mockToast).toBeCalledWith({
          title: 'Unable to update town',
          description: `Error: ${message}`,
          status: 'error',
        }),
      );

      expect(mockedTownController.deleteTown).not.toBeCalled();
    }, 10000);
  });
  describe('Deleting a town', () => {
    it('Passes the form values to apiClient.deleteTown', async () => {
      const params = {
        friendlyName: nanoid(),
        isPubliclyListed: true,
        townID: nanoid(),
      };
      await openSettingsPane(params);

      const coveyTownPassword = nanoid();
      const friendlyName = nanoid();
      fireEvent.change(friendlyNameField, { target: { value: friendlyName } });
      await waitFor(() => expect(friendlyNameField.value).toBe(friendlyName));
      fireEvent.change(passwordField, { target: { value: coveyTownPassword } });
      await waitFor(() => expect(passwordField.value).toBe(coveyTownPassword));
      fireEvent.click(isPublicCheck);
      await waitFor(() => expect(isPublicCheck.checked).toBe(false));
      fireEvent.click(deleteButton);
      await waitFor(() =>
        expect(mockedTownController.deleteTown).toBeCalledWith(coveyTownPassword),
      );
      expect(mockedTownController.updateTown).not.toBeCalled();
    }, 10000);
    it("Displays a toast 'Town deleted' and closes on successful update", async () => {
      const params = {
        friendlyName: nanoid(),
        isPubliclyListed: true,
        townID: nanoid(),
      };

      await openSettingsPane(params);

      const coveyTownPassword = nanoid();
      fireEvent.change(passwordField, { target: { value: coveyTownPassword } });
      await waitFor(() => expect(passwordField.value).toBe(coveyTownPassword));
      fireEvent.click(deleteButton);
      await waitFor(() =>
        expect(mockedTownController.deleteTown).toBeCalledWith(coveyTownPassword),
      );

      await waitFor(() =>
        expect(mockToast).toBeCalledWith({
          title: 'Town deleted',
          status: 'success',
        }),
      );
      expect(mockedTownController.updateTown).not.toBeCalled();
      await waitFor(() => expect(mockUseDisclosure.onClose).toBeCalled());
    }, 10000);
    it("Displays a toast 'Unable to delete town' if an error is thrown by apiClient.deleteTown", async () => {
      const params = {
        friendlyName: nanoid(),
        isPubliclyListed: false,
        townID: nanoid(),
      };

      await openSettingsPane(params);

      const message = `Error${nanoid()}`;
      mockedTownController.deleteTown.mockRejectedValue(new Error(message));

      const coveyTownPassword = nanoid();
      fireEvent.change(passwordField, { target: { value: coveyTownPassword } });
      await waitFor(() => expect(passwordField.value).toBe(coveyTownPassword));
      fireEvent.click(deleteButton);

      await waitFor(() =>
        expect(mockToast).toBeCalledWith({
          title: 'Unable to delete town',
          description: `Error: ${message}`,
          status: 'error',
        }),
      );

      expect(mockedTownController.updateTown).not.toBeCalled();
    }, 10000);
  });
});
