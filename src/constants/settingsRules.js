export const DEFAULT_STOCK_STATUSES = [
  "Nueva",
  "1er Recapado",
  "2do Recapado",
  "3er Recapado",
];

export const getUpdateRules = () => {
  return {
    autoCheckForUpdates: localStorage.getItem("autoCheckForUpdates") !== "false",
  };
};
