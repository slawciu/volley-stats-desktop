import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  DataGrid,
  GridActionsCellItem,
  GridColDef,
  GridRowParams,
  GridValueFormatterParams,
  GridValueGetterParams,
} from "@mui/x-data-grid";
import RotateRightIcon from "@mui/icons-material/RotateRight";
import DeleteIcon from "@mui/icons-material/Delete";
import { SocketContext } from "../../context/socket";
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Button from '@mui/material/Button';
import { GameDetails } from "../../types/game-details";
import { API_URL } from "../../config";

export default function DataTable() {
  const [games, setGames] = useState<GameDetails[]>([]);
  const client = useContext(SocketContext);
  const [confirmationDialogContext, setConfirmationDialogContext] = useState({ isOpen: false, gameId: "", gameName: "" });
  const deleteGame = useCallback(async (gameId: string) => {
    try {
      await fetch(`${API_URL}/api/games/${gameId}`, {
        method: "DELETE"
      });
    } catch (e) {
      console.log(e);
    }
  }, []);

  const columns = useMemo(() => [
    { field: "gameName", headerName: "Nazwa", flex: 1 },
    { field: "home", headerName: "Gospodarz", flex: 0.5 },
    { field: "visitor", headerName: "Goście", flex: 0.5 },
    {
      field: "spreadsheetUrl",
      headerName: "Pełne statystyki",
      flex: 1,
    },
    {
      field: "actions",
      type: "actions",
      getActions: (params: GridRowParams) => [
        <GridActionsCellItem
          icon={<DeleteIcon />}
          onClick={() => {
            console.log(params);
            setConfirmationDialogContext({
              gameId: params.id as string,
              gameName: params.row.gameName,
              isOpen: true
            });
          }}

          label="Delete"
        />,
      ],
    },
  ], []);

  const fetchGames = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/api/games`);
      const data = await response.json();
      setGames([...data]);
    } catch (e) {
      console.log(e);
    }
  }, []);

  useEffect(() => {
    client.on("game-deleted", fetchGames);

    return () => {
      client.off("game-deleted");
    };
  }, []);

  useEffect(() => {
    fetchGames();
  }, []);

  const handleClose = () => {
    setConfirmationDialogContext({
      gameId: "",
      isOpen: false,
      gameName: ""
    });
  };

  return (
    <div style={{ height: "60vh", width: "100%" }}>
      <DataGrid
        rows={games
          .filter((g) => g.gameId !== null)
          .map((g) => ({ id: g.gameId, ...g }))}
        columns={columns}
        pageSize={10}
        rowsPerPageOptions={[5]}
      />
      <Dialog
        open={confirmationDialogContext.isOpen}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          Czy na pewno chcesz usunąć tę grę?
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            {`Usunięcie jest nieodwracalne. Czy na pewno chcesz usunąć grę `}
            <b>{confirmationDialogContext.gameName}</b>?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Anuluj</Button>
          <Button color="error" onClick={() => { deleteGame(confirmationDialogContext.gameId); handleClose(); }} autoFocus>
            Usuń
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
