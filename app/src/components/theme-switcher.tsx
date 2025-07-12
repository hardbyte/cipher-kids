import { Button } from '@/components/ui';
import { IconMoon, IconSun } from '@intentui/icons';
import { useTheme } from '@/components/theme/use-theme';
import { useUser } from '@/context/use-user';
import { useState, useEffect } from 'react';

interface Props {
	appearance?: 'plain' | 'outline';
	showDropdown?: boolean;
}

export function ThemeSwitcher({ appearance = 'plain', showDropdown = false }: Props) {
	const { theme, setTheme } = useTheme();
	const { getUserConfig, updateUserConfig, currentUser } = useUser();
	const [isDropdownOpen, setIsDropdownOpen] = useState(false);

	// Sync theme with user config
	useEffect(() => {
		if (currentUser) {
			const userConfig = getUserConfig();
			if (userConfig.theme !== theme) {
				setTheme(userConfig.theme);
			}
		}
	}, [currentUser, getUserConfig, setTheme, theme]);

	const handleThemeChange = (newTheme: 'light' | 'dark' | 'system' | 'matrix') => {
		setTheme(newTheme);
		if (currentUser) {
			updateUserConfig({ theme: newTheme });
		}
		setIsDropdownOpen(false);
	};

	const getThemeIcon = () => {
		switch (theme) {
			case 'light':
				return <span className="h-[1.2rem] w-[1.2rem] flex items-center justify-center text-lg">☀️</span>;
			case 'dark':
				return <span className="h-[1.2rem] w-[1.2rem] flex items-center justify-center text-lg">🌙</span>;
			case 'system':
				return <span className="h-[1.2rem] w-[1.2rem] flex items-center justify-center text-sm font-bold text-fg">⚙</span>;
			case 'matrix':
				return <span className="h-[1.2rem] w-[1.2rem] flex items-center justify-center text-sm font-mono text-accent">{"01"}</span>;
			default:
				return <span className="h-[1.2rem] w-[1.2rem] flex items-center justify-center text-lg">☀️</span>;
		}
	};

	if (showDropdown) {
		return (
			<div className="relative">
				<Button
					intent={appearance}
					size="square-petite"
					aria-label="Switch theme"
					onPress={() => setIsDropdownOpen(!isDropdownOpen)}
				>
					{getThemeIcon()}
				</Button>
				
				{isDropdownOpen && (
					<div className="absolute right-0 mt-2 bg-bg border border-muted rounded-md shadow-lg z-50 min-w-32">
						<div className="py-1">
							<button
								className="w-full px-3 py-2 text-left text-sm hover:bg-muted/20 flex items-center gap-2"
								onClick={() => handleThemeChange('light')}
							>
								<IconSun className="h-4 w-4" />
								Light
								{theme === 'light' && <span className="ml-auto text-primary">✓</span>}
							</button>
							<button
								className="w-full px-3 py-2 text-left text-sm hover:bg-muted/20 flex items-center gap-2"
								onClick={() => handleThemeChange('dark')}
							>
								<IconMoon className="h-4 w-4" />
								Dark
								{theme === 'dark' && <span className="ml-auto text-primary">✓</span>}
							</button>
							<button
								className="w-full px-3 py-2 text-left text-sm hover:bg-muted/20 flex items-center gap-2 text-fg"
								onClick={() => handleThemeChange('system')}
							>
								<span className="h-4 w-4 flex items-center justify-center text-xs text-fg">⚙</span>
								System
								{theme === 'system' && <span className="ml-auto text-primary">✓</span>}
							</button>
							<button
								className="w-full px-3 py-2 text-left text-sm hover:bg-muted/20 flex items-center gap-2"
								onClick={() => handleThemeChange('matrix')}
							>
								<span className="h-4 w-4 flex items-center justify-center text-xs font-mono">{"01"}</span>
								Matrix
								{theme === 'matrix' && <span className="ml-auto text-primary">✓</span>}
							</button>
						</div>
					</div>
				)}
			</div>
		);
	}

	// Simple toggle behavior for backward compatibility
	const cycleTheme = () => {
		const themes: ('light' | 'dark' | 'system' | 'matrix')[] = ['light', 'dark', 'matrix', 'system'];
		const currentIndex = themes.indexOf(theme);
		const nextTheme = themes[(currentIndex + 1) % themes.length];
		handleThemeChange(nextTheme);
	};

	return (
		<Button
			intent={appearance}
			size="square-petite"
			aria-label="Switch theme"
			onPress={cycleTheme}
		>
			{getThemeIcon()}
		</Button>
	);
}
