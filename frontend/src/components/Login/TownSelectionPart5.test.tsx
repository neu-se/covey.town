import '@testing-library/jest-dom'
import { RenderResult, waitFor} from '@testing-library/react'
import userEvent, { TargetElement } from '@testing-library/user-event';
import TownsServiceClient from '../../classes/TownsServiceClient';

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
const mockSignIn = jest.fn();
TownsServiceClient.prototype.signIn = mockSignIn;


describe('login features', () => {
  let renderData: RenderResult<typeof import("@testing-library/dom/types/queries")>;
  let returningLoginField: HTMLInputElement;
  let returningPasswordField: HTMLInputElement;

  let signInButton: TargetElement;


  beforeEach(async () => {
    doLoginMock.mockReset();
    mockConnect.mockReset();
    mockToast.mockReset();
    mockSignIn.mockReset();

    // Assemble all the testing envirnment
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
    userEvent.type(returningLoginField, 'Nice guy');
    userEvent.type(returningPasswordField, '');
    userEvent.click(signInButton);

    await waitFor(() => {
      expect(returningLoginField.value).toBe('Nice guy')
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
})