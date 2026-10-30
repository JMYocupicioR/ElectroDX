import {
  LiveClassCreateDrawer,
  type LiveClassCreateDrawerProps,
} from './LiveClassCreateDrawer';

export type CreateLiveClassModalProps = LiveClassCreateDrawerProps;

/** Panel lateral para crear o editar una clase en vivo. */
export function CreateLiveClassModal(props: CreateLiveClassModalProps) {
  return <LiveClassCreateDrawer {...props} />;
}

export default CreateLiveClassModal;
