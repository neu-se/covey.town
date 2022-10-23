/* eslint-disable no-await-in-loop,@typescript-eslint/no-loop-func,no-restricted-syntax */
import { ChakraProvider } from '@chakra-ui/react';
import '@testing-library/jest-dom';
import React from 'react';
import { fireEvent, render, RenderResult, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { mock, mockClear, MockProxy, mockReset } from 'jest-mock-extended';
import { nanoid } from 'nanoid';
import { act } from 'react-dom/test-utils';
import * as TownController from '../../classes/TownController';
import { LoginController } from '../../contexts/LoginControllerContext';
import { CancelablePromise, Town, TownsService } from '../../generated/client';
import * as useLoginController from '../../hooks/useLoginController';
import { mockTownController } from '../../TestUtils';
import TownSelection from './TownSelection';

const mockConnect = jest.fn(() => Promise.resolve());

const mockToast = jest.fn();
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
function toCancelablePromise<T>(p: T): CancelablePromise<T> {
  return new CancelablePromise(async resolve => {
    resolve(p);
  });
}
const listTowns = (suffix: string) =>
  toCancelablePromise(
    [
      {
        friendlyName: `town1${suffix}`,
        townID: `1${suffix}`,
        currentOccupancy: 0,
        maximumOccupancy: 1,
      },
      {
        friendlyName: `town2${suffix}`,
        townID: `2${suffix}`,
        currentOccupancy: 2,
        maximumOccupancy: 10,
      },
      {
        friendlyName: `town3${suffix}`,
        townID: `3${suffix}`,
        currentOccupancy: 1,
        maximumOccupancy: 1,
      },
      {
        friendlyName: `town4${suffix}`,
        townID: `4${suffix}`,
        currentOccupancy: 8,
        maximumOccupancy: 8,
      },
      {
        friendlyName: `town5${suffix}`,
        townID: `5${suffix}`,
        currentOccupancy: 9,
        maximumOccupancy: 5,
      },
      {
        friendlyName: `town6${suffix}`,
        townID: `6${suffix}`,
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
  );

export function wrappedTownSelection() {
  return (
    <ChakraProvider>
      <TownSelection />
    </ChakraProvider>
  );
}

describe('Town Selection', () => {
  let mockTownsService: MockProxy<TownsService>;
  let useLoginControllerSpy: jest.SpyInstance<LoginController, []>;
  let mockLoginController: MockProxy<LoginController>;
  let coveyTownControllerConstructorSpy: jest.SpyInstance<
    TownController.default,
    [TownController.ConnectionProperties]
  >;
  let mockedTownController: MockProxy<TownController.default>;
  const expectedProviderVideoToken = nanoid();

  beforeAll(() => {
    mockTownsService = mock<TownsService>();
    useLoginControllerSpy = jest.spyOn(useLoginController, 'default');
    mockLoginController = mock<LoginController>();
    mockLoginController.townsService = mockTownsService;

    mockedTownController = mockTownController({ providerVideoToken: expectedProviderVideoToken });

    coveyTownControllerConstructorSpy = jest.spyOn(TownController, 'default');
  });
  beforeEach(() => {
    jest.useFakeTimers();
    mockReset(mockTownsService);
    mockClear(useLoginControllerSpy);
    mockClear(mockLoginController);
    mockClear(mockedTownController);
    mockClear(coveyTownControllerConstructorSpy);
    useLoginControllerSpy.mockReturnValue(mockLoginController);
    coveyTownControllerConstructorSpy.mockReturnValue(mockedTownController);
    mockedTownController.connect.mockReturnValue(Promise.resolve());
  });
  describe('Listing public towns', () => {
    it('is called when rendering (hopefully by a useeffect, this will be checked manually)', async () => {
      jest.useRealTimers();
      mockTownsService.listTowns.mockImplementation(() => listTowns(nanoid()));
      const renderData = render(wrappedTownSelection());
      await waitFor(
        () => {
          expect(mockTownsService.listTowns).toHaveBeenCalledTimes(1);
        },
        { timeout: 200 },
      );
      renderData.unmount();
    });
    it('updates every 2000 msec', async () => {
      mockTownsService.listTowns.mockImplementation(() => listTowns(nanoid()));
      const renderData = render(wrappedTownSelection());
      await waitFor(() => {
        expect(mockTownsService.listTowns).toBeCalledTimes(1);
      });
      jest.advanceTimersByTime(2000);
      await waitFor(() => {
        expect(mockTownsService.listTowns).toBeCalledTimes(2);
      });
      jest.advanceTimersByTime(1000);
      await waitFor(() => {
        expect(mockTownsService.listTowns).toBeCalledTimes(2);
      });
      renderData.unmount();
    });
    it('stops updating when unmounted', async () => {
      mockTownsService.listTowns.mockImplementation(() => listTowns(nanoid()));
      const renderData = render(wrappedTownSelection());
      await waitFor(() => {
        expect(mockTownsService.listTowns).toBeCalledTimes(1);
      });
      jest.advanceTimersByTime(2000);
      await waitFor(() => {
        expect(mockTownsService.listTowns).toBeCalledTimes(2);
      });
      renderData.unmount();
      jest.advanceTimersByTime(10000);
      await waitFor(() => {
        expect(mockTownsService.listTowns).toBeCalledTimes(2);
      });
    });
    it('updates the page with all towns stored in currentPublicTowns', async () => {
      const suffix1 = nanoid();
      const suffix2 = nanoid();
      const expectedTowns1 = await listTowns(suffix1);
      const expectedTowns2 = await listTowns(suffix2);
      mockTownsService.listTowns.mockImplementation(() => listTowns(suffix1));
      const renderData = render(wrappedTownSelection());
      await waitFor(() => {
        expectedTowns1.map(town =>
          expect(renderData.getByText(town.friendlyName)).toBeInTheDocument(),
        );
      });
      mockTownsService.listTowns.mockImplementation(() => listTowns(suffix2));
      jest.advanceTimersByTime(2000);
      await waitFor(() => {
        expectedTowns2.forEach(town =>
          expect(renderData.getByText(town.friendlyName)).toBeInTheDocument(),
        );
        expectedTowns1.forEach(town =>
          expect(renderData.queryByText(town.friendlyName)).not.toBeInTheDocument(),
        );
      });
    });
    it('does not include the hardcoded demo in the listing', async () => {
      const suffix = nanoid();
      const expectedTowns1 = await listTowns(suffix);
      mockTownsService.listTowns.mockImplementation(() => listTowns(suffix));
      const renderData = render(wrappedTownSelection());
      await waitFor(() => {
        expectedTowns1.map(town =>
          expect(renderData.getByText(town.friendlyName)).toBeInTheDocument(),
        );
      });
      expect(renderData.queryByText('demoTownName')).not.toBeInTheDocument();
    });
    it('sorts towns by occupancy descending', async () => {
      const suffix1 = nanoid();
      const suffix2 = nanoid();
      let expectedTowns1 = await listTowns(suffix1);
      expectedTowns1 = expectedTowns1.sort((a, b) => b.currentOccupancy - a.currentOccupancy);

      let expectedTowns2 = await listTowns(suffix2);
      expectedTowns2 = expectedTowns2.sort((a, b) => b.currentOccupancy - a.currentOccupancy);

      mockTownsService.listTowns.mockImplementation(() => listTowns(suffix1));
      const renderData = render(wrappedTownSelection());
      await waitFor(() => {
        expectedTowns1.map(town =>
          expect(renderData.getByText(town.friendlyName)).toBeInTheDocument(),
        );
      });
      // All towns are in doc, now make sure they are sorted by occupancy
      let rows = renderData.getAllByRole('row');
      for (let i = 1; i < rows.length; i += 1) {
        // off-by-one for the header row
        // console.log(rows[i]);
        const existing = within(rows[i]).getByText(expectedTowns1[i - 1].friendlyName);
        expect(existing).toBeInTheDocument();
        for (let j = 0; j < expectedTowns1.length; j += 1) {
          if (j !== i - 1) {
            expect(
              within(rows[i]).queryByText(expectedTowns1[j].friendlyName),
            ).not.toBeInTheDocument();
          }
        }
      }
      // Now, do that all again to make sure it sorts EVERY run
      mockTownsService.listTowns.mockImplementation(() => listTowns(suffix2));
      jest.advanceTimersByTime(2000);
      await waitFor(() =>
        expectedTowns2.map(town =>
          expect(renderData.getByText(town.friendlyName)).toBeInTheDocument(),
        ),
      );

      // All towns are in doc, now make sure they are sorted by occupancy
      rows = renderData.getAllByRole('row');
      for (let i = 1; i < rows.length; i += 1) {
        // off-by-one for the header row
        // console.log(rows[i]);
        const existing = within(rows[i]).getByText(expectedTowns2[i - 1].friendlyName);
        expect(existing).toBeInTheDocument();
        for (let j = 0; j < expectedTowns2.length; j += 1) {
          if (j !== i - 1) {
            expect(
              within(rows[i]).queryByText(expectedTowns2[j].friendlyName),
            ).not.toBeInTheDocument();
          }
        }
      }
    });
    it('represents each row in the table as specified', async () => {
      const suffix1 = nanoid();
      let expectedTowns = await listTowns(suffix1);
      expectedTowns = expectedTowns.sort((a, b) => b.currentOccupancy - a.currentOccupancy);
      mockTownsService.listTowns.mockImplementation(() => listTowns(suffix1));
      const renderData = render(wrappedTownSelection());
      await waitFor(() => {
        expectedTowns.forEach(town =>
          expect(renderData.getByText(town.friendlyName)).toBeInTheDocument(),
        );
      });
      const rows = renderData.getAllByRole('row');
      expectedTowns.forEach(town => {
        const row = rows.find(each => within(each).queryByText(town.townID));
        if (row) {
          const cells = within(row).queryAllByRole('cell');
          // Cell order: friendlyName, TownID, occupancy/join + button
          expect(cells.length).toBe(3);
          expect(within(cells[0]).queryByText(town.friendlyName)).toBeInTheDocument();
          expect(within(cells[1]).queryByText(town.townID)).toBeInTheDocument();
          expect(
            within(cells[2]).queryByText(`${town.currentOccupancy}/${town.maximumOccupancy}`),
          ).toBeInTheDocument();
        } else {
          fail(`Could not find row for town ${town.townID}`);
        }
      });
    });
  });

  describe('Creating and joining towns', () => {
    let renderData: RenderResult<typeof import('@testing-library/dom/types/queries')>;
    let townIDToJoinField: HTMLInputElement;
    let userNameField: HTMLInputElement;
    let joinTownByIDButton: HTMLElement;
    let expectedTowns: Town[];
    let newTownNameField: HTMLInputElement;
    let newTownIsPublicCheckbox: HTMLInputElement;
    let newTownButton: HTMLElement;

    beforeEach(async () => {
      jest.useFakeTimers();
      mockConnect.mockReset();
      mockToast.mockReset();

      const suffix = nanoid();
      expectedTowns = await listTowns(suffix);
      mockTownsService.listTowns.mockImplementation(() => listTowns(suffix));
      renderData = render(wrappedTownSelection());
      await waitFor(() => expect(renderData.getByText(`town1${suffix}`)).toBeInTheDocument());
      townIDToJoinField = renderData.getByPlaceholderText(
        'ID of town to join, or select from list',
      ) as HTMLInputElement;
      userNameField = renderData.getByPlaceholderText('Your name') as HTMLInputElement;
      joinTownByIDButton = renderData.getByTestId('joinTownByIDButton');
      newTownIsPublicCheckbox = renderData.getByLabelText('Publicly Listed') as HTMLInputElement;
      newTownNameField = renderData.getByPlaceholderText('New Town Name') as HTMLInputElement;
      newTownButton = renderData.getByTestId('newTownButton');
    });
    describe('Joining existing towns', () => {
      describe('Joining an existing town by ID', () => {
        const joinTownWithOptions = async (params: { coveyTownID: string; userName: string }) => {
          fireEvent.change(userNameField, { target: { value: params.userName } });
          await waitFor(() => {
            expect(userNameField.value).toBe(params.userName);
          });
          fireEvent.change(townIDToJoinField, { target: { value: params.coveyTownID } });
          await waitFor(() => expect(townIDToJoinField.value).toBe(params.coveyTownID));
          userEvent.click(joinTownByIDButton);
        };

        it('includes a connect button, which creates a new TownController and connects with the entered username and coveyTownID', async () => {
          const coveyTownID = nanoid();
          const userName = nanoid();

          await joinTownWithOptions({
            coveyTownID,
            userName,
          });

          // Check for call sequence
          await waitFor(() =>
            expect(coveyTownControllerConstructorSpy).toBeCalledWith({
              userName,
              townID: coveyTownID,
              loginController: mockLoginController,
            }),
          );
          await waitFor(() => expect(mockedTownController.connect).toBeCalled());
          await waitFor(() => expect(mockConnect).toBeCalledWith(expectedProviderVideoToken));
          await waitFor(() =>
            expect(mockLoginController.setTownController).toBeCalledWith(mockedTownController),
          );
        });
        it('displays an error toast "Unable to join town" if the username is empty', async () => {
          const coveyTownID = nanoid();
          await joinTownWithOptions({
            coveyTownID,
            userName: '',
          });
          await waitFor(() =>
            expect(mockToast).toBeCalledWith({
              description: 'Please select a username',
              title: 'Unable to join town',
              status: 'error',
            }),
          );
        });
        it('displays an error toast "Unable to join town" if the TownID is empty', async () => {
          const userName = nanoid();
          await joinTownWithOptions({
            coveyTownID: '',
            userName,
          });
          await waitFor(() =>
            expect(mockToast).toBeCalledWith({
              description: 'Please enter a town ID',
              title: 'Unable to join town',
              status: 'error',
            }),
          );
        });

        it('displays an error toast "Unable to connect to Towns Service" if an error occurs', async () => {
          const coveyTownID = nanoid();
          const userName = nanoid();
          const errorMessage = `Err${nanoid()}`;

          // Configure mocks
          mockedTownController.connect.mockRejectedValue(new Error(errorMessage));

          await joinTownWithOptions({
            coveyTownID,
            userName,
          });

          // Check for call sequence
          await waitFor(() =>
            expect(mockToast).toBeCalledWith({
              description: `Error: ${errorMessage}`,
              title: 'Unable to connect to Towns Service',
              status: 'error',
            }),
          );
        });
      });
      describe('Joining an existing town from public town table', () => {
        it('includes a connect button in each row, which calls Video.setup, doLogin, and connect with the entered username and coveyTownID corresponding to that town', async () => {
          const rows = renderData.getAllByRole('row');
          for (const town of expectedTowns) {
            if (town.currentOccupancy < town.maximumOccupancy) {
              mockClear(mockedTownController);
              mockClear(mockLoginController);
              mockClear(coveyTownControllerConstructorSpy);
              mockConnect.mockClear();
              const row = rows.find(each => within(each).queryByText(town.townID));
              if (row) {
                const button = within(row).getByRole('button');
                const username = nanoid();
                act(() => {
                  fireEvent.change(userNameField, { target: { value: username } });
                });
                await waitFor(() => {
                  expect(userNameField.value).toBe(username);
                });
                act(() => {
                  fireEvent.click(button);
                });
                // userEvent.click(button);

                await waitFor(() =>
                  expect(coveyTownControllerConstructorSpy).toBeCalledWith({
                    userName: username,
                    townID: town.townID,
                    loginController: mockLoginController,
                  }),
                );

                await waitFor(() => expect(mockedTownController.connect).toBeCalled());
                await waitFor(() => expect(mockConnect).toBeCalledWith(expectedProviderVideoToken));
                await waitFor(() =>
                  expect(mockLoginController.setTownController).toBeCalledWith(
                    mockedTownController,
                  ),
                );
              } else {
                fail(`Could not find row for town ${town.townID}`);
              }
            }
          }
        });
        it('disables the connect button if town is at or over capacity', async () => {
          const rows = renderData.getAllByRole('row');
          for (const town of expectedTowns) {
            if (town.currentOccupancy >= town.maximumOccupancy) {
              const row = rows.find(each => within(each).queryByText(town.townID));
              if (row) {
                const button = within(row).getByRole('button');
                const username = nanoid();
                act(() => {
                  fireEvent.change(userNameField, { target: { value: username } });
                });
                await waitFor(() => {
                  expect(userNameField.value).toBe(username);
                });
                act(() => {
                  fireEvent.click(button);
                });
                await waitFor(() => expect(coveyTownControllerConstructorSpy).not.toBeCalled());
              } else {
                fail(`Could not find row for town ${town.townID}`);
              }
            }
          }
        });
      });
    });
    describe('Creating a new town', () => {
      const createTownWithOptions = async (params: {
        townName: string;
        userName: string;
        togglePublicBox?: boolean;
        townID?: string;
        roomPassword?: string;
        errorMessage?: string;
      }) => {
        fireEvent.change(userNameField, { target: { value: params.userName } });
        await waitFor(() => {
          expect(userNameField.value).toBe(params.userName);
        });
        fireEvent.change(newTownNameField, { target: { value: params.townName } });
        await waitFor(() => expect(newTownNameField.value).toBe(params.townName));
        if (params.togglePublicBox) {
          fireEvent.click(newTownIsPublicCheckbox);
          await waitFor(() => expect(newTownIsPublicCheckbox.checked).toBe(false));
        }
        mockTownsService.createTown.mockClear();
        if (params.townID && params.roomPassword) {
          mockTownsService.createTown.mockReturnValue(
            toCancelablePromise({
              townID: params.townID,
              townUpdatePassword: params.roomPassword,
            }),
          );
        } else if (params.errorMessage) {
          mockTownsService.createTown.mockRejectedValue(new Error(params.errorMessage));
        } else {
          fail('Invalid config');
        }
        userEvent.click(newTownButton);
      };
      describe('when clicking create', () => {
        describe('with invalid values', () => {
          it('displays an error toast "Unable to create town" if the username is empty', async () => {
            await createTownWithOptions({
              userName: '',
              townName: nanoid(),
              errorMessage: 'FAIL',
            });
            await waitFor(() =>
              expect(mockToast).toBeCalledWith({
                title: 'Unable to create town',
                description: 'Please select a username before creating a town',
                status: 'error',
              }),
            );
          });
          it('displays an error toast "Unable to create town" if the newTownName is empty', async () => {
            await createTownWithOptions({
              townName: '',
              userName: nanoid(),
              errorMessage: 'FAIL',
            });
            await waitFor(() =>
              expect(mockToast).toBeCalledWith({
                title: 'Unable to create town',
                description: 'Please enter a town name',
                status: 'error',
              }),
            );
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
              roomPassword,
            });
            await waitFor(() =>
              expect(mockTownsService.createTown).toBeCalledWith({
                friendlyName: townName,
                isPubliclyListed: true,
              }),
            );
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
              togglePublicBox: true,
            });
            await waitFor(() =>
              expect(mockTownsService.createTown).toBeCalledWith({
                friendlyName: townName,
                isPubliclyListed: false,
              }),
            );
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
              togglePublicBox: true,
            });
            await waitFor(() =>
              expect(mockTownsService.createTown).toBeCalledWith({
                friendlyName: townName,
                isPubliclyListed: false,
              }),
            );
            await waitFor(() =>
              expect(mockToast).toBeCalledWith(
                expect.objectContaining({
                  title: `Town ${townName} is ready to go!`,
                  status: 'success',
                  isClosable: true,
                  duration: null,
                }),
              ),
            );
          });
          it('after success, creates a new TownController and connects with the entered username and newly generated townID', async () => {
            const townID = nanoid();
            const roomPassword = nanoid();
            const userName = nanoid();
            const townName = nanoid();

            // Create town
            await createTownWithOptions({
              townName,
              userName,
              townID,
              roomPassword,
              togglePublicBox: true,
            });

            // Check for call sequence
            await waitFor(() =>
              expect(coveyTownControllerConstructorSpy).toBeCalledWith({
                userName,
                townID: townID,
                loginController: mockLoginController,
              }),
            );
            await waitFor(() => expect(mockedTownController.connect).toBeCalled());
            await waitFor(() => expect(mockConnect).toBeCalledWith(expectedProviderVideoToken));
            await waitFor(() =>
              expect(mockLoginController.setTownController).toBeCalledWith(mockedTownController),
            );
          });
          it('displays an error toast "Unable to connect to Towns Service" if an error occurs in createTown', async () => {
            const errorMessage = `Oops#${nanoid()}`;
            const townName = nanoid();
            await createTownWithOptions({
              townName,
              userName: nanoid(),
              errorMessage,
            });
            await waitFor(() =>
              expect(mockTownsService.createTown).toBeCalledWith({
                friendlyName: townName,
                isPubliclyListed: true,
              }),
            );
            await waitFor(() =>
              expect(mockToast).toBeCalledWith({
                title: 'Unable to connect to Towns Service',
                status: 'error',
                description: `Error: ${errorMessage}`,
              }),
            );
          });
        });
      });
    });
  });
});
