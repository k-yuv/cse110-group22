import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SettingsButton from '../SettingsButton';

describe('SettingsButton', () => {
    it('renders the settings button', () => {
        render(<SettingsButton />);

        expect(
            screen.getByRole('button', {
                name: 'Open settings',
            })
        ).toBeInTheDocument();
    });

    it('does not show the popup initially', () => {
        render(<SettingsButton />);

        expect(
            screen.queryByRole('dialog')
        ).not.toBeInTheDocument();
    });

    it('opens the popup when clicked', async () => {
        const user = userEvent.setup();
        render(<SettingsButton />);

        await user.click(
            screen.getByRole('button', {
                name: 'Open settings',
            })
        );

        expect(
            screen.getByRole('dialog', {
                name: 'Settings',
            })
        ).toBeInTheDocument();
    });

    it('closes the popup when X is clicked', async () => {
        const user = userEvent.setup();
        render(<SettingsButton />);

        await user.click(
            screen.getByRole('button', {
                name: 'Open settings',
            })
        );

        await user.click(
            screen.getByRole('button', {
                name: 'Close popup',
            })
        );

        expect(
            screen.queryByRole('dialog')
        ).not.toBeInTheDocument();
    });

    it('supports custom icon sizes', () => {
        render(<SettingsButton size={80} />);

        expect(
            screen.getByRole('button', {
                name: 'Open settings',
            })
        ).toHaveStyle({
            width: '80px',
            height: '80px',
        });
    });
});
