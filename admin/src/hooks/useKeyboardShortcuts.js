import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function useKeyboardShortcuts() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyPress = (event) => {
      const isTyping = ['INPUT', 'TEXTAREA', 'SELECT'].includes(
        document.activeElement.tagName
      );

      if (isTyping) return;

      // Ctrl/Cmd + K: Focus search
      if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
        event.preventDefault();
        const searchInput = document.querySelector('#search-filter');
        if (searchInput) {
          searchInput.focus();
        }
      }

      // Alt + D: Dashboard
      if (event.altKey && event.key === 'd') {
        event.preventDefault();
        navigate('/');
      }

      // Alt + C: Complaints
      if (event.altKey && event.key === 'c') {
        event.preventDefault();
        navigate('/complaints');
      }

      // Alt + A: Analytics
      if (event.altKey && event.key === 'a') {
        event.preventDefault();
        navigate('/analytics');
      }

      // Alt + P: Profile
      if (event.altKey && event.key === 'p') {
        event.preventDefault();
        navigate('/profile');
      }

      // ? : Show shortcuts help
      if (event.key === '?' && !event.shiftKey) {
        event.preventDefault();
        const shortcuts = [
          'Ctrl/Cmd + K → Focus search',
          'Alt + D → Dashboard',
          'Alt + C → Complaints',
          'Alt + A → Analytics',
          'Alt + P → Profile',
          '? → Show this help'
        ];
        alert('⌨️ Keyboard Shortcuts:\n\n' + shortcuts.join('\n'));
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [navigate]);
}   