import { visuallyHidden } from '../../helpers';
import { OPEN_LABEL, type JournalPlacementName } from './journalContent';
import { useJournalViewModel } from './journalViewModel';
import JournalDock from './parts/JournalDock';
import JournalOverlay from './parts/JournalOverlay';

interface JournalProps {
  placement?: JournalPlacementName;
}

// The evidence notebook: docked on the screen, and opened by clicking it. Add
// it to a screen with one line, next to that screen's <Stage>. Display only:
// everything comes from useJournalViewModel.
export default function Journal({ placement = 'desk' }: JournalProps) {
  const {
    isOpen,
    width,
    height,
    sizeUnit,
    spreadEvidence,
    page,
    pageCount,
    hasPreviousPage,
    hasNextPage,
    onOpen,
    onClose,
    onPreviousPage,
    onNextPage,
  } = useJournalViewModel();

  return (
    <>
      <button type="button" style={visuallyHidden} onClick={onOpen}>
        {OPEN_LABEL}
      </button>

      <JournalDock
        placement={placement}
        windowWidth={width}
        windowHeight={height}
        sizeUnit={sizeUnit}
        onOpen={onOpen}
      />

      {isOpen && (
        <JournalOverlay
          windowWidth={width}
          windowHeight={height}
          evidence={spreadEvidence}
          page={page}
          pageCount={pageCount}
          hasPreviousPage={hasPreviousPage}
          hasNextPage={hasNextPage}
          onClose={onClose}
          onPreviousPage={onPreviousPage}
          onNextPage={onNextPage}
        />
      )}
    </>
  );
}
