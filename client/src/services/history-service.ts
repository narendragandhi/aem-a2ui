import { ContentSuggestion } from '../lib/types';

const HISTORY_KEY = 'aem-assistant-history';

export class HistoryService {
  static getHistory(): ContentSuggestion[] {
    const history = localStorage.getItem(HISTORY_KEY);
    return history ? JSON.parse(history) : [];
  }

  static addSuggestion(suggestion: ContentSuggestion) {
    const history = HistoryService.getHistory();
    // Prepend new suggestion, limit to 10 entries
    const newHistory = [suggestion, ...history.filter((item) => item.id !== suggestion.id)].slice(0, 10);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(newHistory));
  }

  static clearHistory() {
    localStorage.removeItem(HISTORY_KEY);
  }
}
