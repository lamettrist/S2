'use client';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { RxPlus } from "react-icons/rx";
import { SlPencil } from "react-icons/sl";

interface Team {
    'teamName': string,
    'teamPoints': number,
    'teamBets': number,
    'teamWon': number,
    'members'?: [{
        'name': string,
        'points': number,
        'bets': number,
    }] | null,
}

export interface gameSchema {
    'name': string,
    'team': Team[],
    'id': string,
    'record': {
            'round': number,
            'team': Team[],
        }[],
}

export default function GameComponent({game, setGame}: {game: gameSchema, setGame: Dispatch<SetStateAction<gameSchema | null>>}) {
    const [openTeamID, setOpenTeamID] = useState<number | null>(null);
    const [winningTeam, setWinningTeam] = useState<Team | null>(null);

    useEffect(() => {
        // Calculate which team won game :checkmark:
        let winningTeam = game.team[0];
        for (let i = 1; i < game.team.length; i++) {
            if (game.team[i].teamPoints > winningTeam.teamPoints) {
                winningTeam = game.team[i];
            }
        }
        setWinningTeam(winningTeam);
    }, [game]);

    function addTeam() {
        let existingGame: gameSchema = {
            'name': game.name,
            'team': [...game.team],
            'id': game.id,
            'record': [...game.record],
        };
        existingGame.team.push({
            'teamName': `Team ${existingGame.team.length + 1}`,
            'teamPoints': 0,
            'teamBets': 0,
            'teamWon': 0,
            'members': null,
        })
        // preserve recorder logic while adding the new team
        for (let i = 0; i < 13; i++) {
            existingGame.record[i].team.push({
                'teamName': `Team ${existingGame.team.length}`,
                'teamPoints': 0,
                'teamBets': 0,
                'teamWon': 0,
                'members': null,
            })            
        }
        // setgame
        setGame(existingGame);
    }

    function renameTeam(index: number, newName: string) {
        let existingGame: gameSchema = {
            'name': game.name,
            'team': [...game.team],
            'id': game.id,
            'record': [...game.record],
        };
        existingGame.team[index].teamName = newName;
        setGame(existingGame);
        setOpenTeamID(null);
    }

    return (
        <div className="overflow-x-auto">
            <Table className="mt-5" style={{ minWidth: `${112 + game.team.length * 160 + 48}px` }}>
                <TableHeader>
                        <TableRow className="justify-center flex-1 items-center">
                            <TableCell className="w-16 text-center">Round</TableCell>
                            {
                                game.team.map((team, index) => (
                                <TableCell key={index} className="font-bold text-center min-w-[160px]">
                                    <div className="flex items-center justify-center gap-1">
                                        <span className="truncate max-w-[110px]">{team.teamName}</span>
                                        <Button
                                        aria-label="Edit team name"
                                        className="h-8 w-8 shrink-0 flex items-center justify-center rounded-xl bg-transparent text-zinc-400 transition-all duration-200 cursor-pointer hover:bg-zinc-200/70 hover:text-zinc-900"
                                        onClick={() => setOpenTeamID(index)}
                                        >
                                        <SlPencil />
                                        </Button>
                                    </div>
                                    <Dialog open={openTeamID === index} onOpenChange={(open) => {
                                            setOpenTeamID(open ? index : null);
                                        }}
                                    >
                                        <DialogContent
                                        >
                                            <DialogHeader>
                                            <DialogTitle>Rename Team</DialogTitle>
                                            <DialogDescription>Please stand out by renaming instead of using Team Name #.</DialogDescription>
                                            </DialogHeader>
                                            <form onSubmit={(e) => {
                                                e.preventDefault();
                                                const newName = new FormData(e.currentTarget).get('team-name')
                                                // @ts-expect-error Expect this error please
                                                renameTeam(index, newName)
                                                }}
                                                className="flex flex-col gap-3"
                                            >
                                                <Input
                                                placeholder="Project A"
                                                type="text"
                                                name="team-name"
                                                className="ml-1 gap-2 h-8 gap-2 w-full shrink-0 items-center justify-center rounded-xl"
                                                />
                                                <Button type="submit"
                                                className="ml-1 flex h-8 gap-2 w-full shrink-0 items-center justify-center rounded-xl text-zinc-600 hover:text-white  font-bold transition-all duration-200 bg-zinc-200/70 cursor-pointer"
                                                >Rename</Button>
                                            </form>
                                        </DialogContent>
                                    </Dialog>                            
                                </TableCell>
                                ))
                            }
                            <TableCell className="w-12 text-center">
                                <Button
                                    aria-label="New game"
                                    className="ml-1 h-8 w-8 shrink-0 flex items-center justify-center rounded-xl bg-transparent text-zinc-400 transition-all duration-200 cursor-pointer hover:bg-zinc-200/70 hover:text-zinc-900"
                                    onClick={() => addTeam()}
                                ><RxPlus /></Button>
                            </TableCell>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {
                            game.record.map((round, i) => {
                                return (
                                    <TableRow key={i} className="justify-center items-center">
                                        <TableCell className="font-bold text-center">{round.round}</TableCell>
                                        {
                                            game.record[i].team.map((team, j) => {
                                                return (
                                                    <TableCell key={j} className="font-bold text-center min-w-[160px]">
                                                        <div className="flex flex-col items-center gap-2">
                                                            <Input placeholder="Bets" type="number" className="w-[50%]" min={0} max={round.round} onChange={(event) => {
                                                                event.preventDefault();
                                                                let existingGame: gameSchema = {
                                                                    'name': game.name,
                                                                    'team': [...game.team],
                                                                    'id': game.id,
                                                                    'record': [...game.record],
                                                                };
                                                                let amount = event.currentTarget.value;
                                                                if (!isNaN(parseInt(amount))) {
                                                                    existingGame.record[i].team[j].teamBets = parseInt(amount);
                                                                    console.log(existingGame.record[i].team[j].teamBets, existingGame.record[i].team[j].teamWon)
                                                                    if (existingGame.record[i].team[j].teamBets < existingGame.record[i].team[j].teamWon) {
                                                                        existingGame.record[i].team[j].teamPoints = (existingGame.record[i].team[j].teamBets * 10) + (existingGame.record[i].team[j].teamWon - existingGame.record[i].team[j].teamBets);
                                                                    } else if (existingGame.record[i].team[j].teamBets > existingGame.record[i].team[j].teamWon) {
                                                                        if (existingGame.record[i].team[j].teamWon > 0) {
                                                                            existingGame.record[i].team[j].teamPoints = -1 * ((10 * existingGame.record[i].team[j].teamBets) - (existingGame.record[i].team[j].teamWon));
                                                                        } else {
                                                                            existingGame.record[i].team[j].teamPoints = -10 * existingGame.record[i].team[j].teamBets;
                                                                        }
                                                                    } else {
                                                                        existingGame.record[i].team[j].teamPoints = existingGame.record[i].team[j].teamBets * 10;
                                                                    }
                                                                } else {
                                                                    existingGame.record[i].team[j].teamPoints = 0
                                                                    existingGame.record[i].team[j].teamBets = NaN;
                                                                }
                                                                // Aggregate along all rounds and update the team points
                                                                let totalPoints = 0;
                                                                let totalBets = 0;
                                                                let totalWins = 0;
                                                                for (let k = 0; k < 13; k++) {
                                                                    totalPoints += existingGame.record[k].team[j].teamPoints;
                                                                    totalBets += existingGame.record[k].team[j].teamBets;
                                                                    totalWins += existingGame.record[k].team[j].teamWon;
                                                                }   
                                                                existingGame.team[j].teamPoints = totalPoints;
                                                                existingGame.team[j].teamBets = totalBets;
                                                                existingGame.team[j].teamWon = totalWins;
                                                                setGame(existingGame);
                                                            }} 
                                                            value={team.teamBets}
                                                            />
                                                            <Input placeholder="Won" type="number" className="w-[50%]" min={0} max={round.round} onChange={(event) => {
                                                                event.preventDefault();
                                                                let existingGame: gameSchema = {
                                                                    'name': game.name,
                                                                    'team': [...game.team],
                                                                    'id': game.id,
                                                                    'record': [...game.record],
                                                                };
                                                                let amount = event.currentTarget.value;
                                                                    if (!isNaN(parseInt(amount))) {
                                                                        existingGame.record[i].team[j].teamWon = parseInt(amount);
                                                                        if (existingGame.record[i].team[j].teamBets < parseInt(amount)) {
                                                                            existingGame.record[i].team[j].teamPoints = (existingGame.record[i].team[j].teamBets * 10) + (existingGame.record[i].team[j].teamWon - existingGame.record[i].team[j].teamBets);
                                                                        } else if (existingGame.record[i].team[j].teamBets > parseInt(amount)) {
                                                                            if (existingGame.record[i].team[j].teamWon > 0) {
                                                                                existingGame.record[i].team[j].teamPoints = -1 * ((10 * existingGame.record[i].team[j].teamBets) - (existingGame.record[i].team[j].teamWon));
                                                                            } else {
                                                                                existingGame.record[i].team[j].teamPoints = -10 * existingGame.record[i].team[j].teamBets;
                                                                            }
                                                                        } else {
                                                                            existingGame.record[i].team[j].teamPoints = existingGame.record[i].team[j].teamBets * 10;
                                                                        }
                                                                    } else {
                                                                        existingGame.record[i].team[j].teamPoints = 0;
                                                                        existingGame.record[i].team[j].teamWon = NaN;
                                                                    }
                                                                // Aggregate along all rounds and update the team points
                                                                let totalPoints = 0;
                                                                let totalBets = 0;
                                                                let totalWins = 0;
                                                                for (let k = 0; k < 13; k++) {
                                                                    totalPoints += existingGame.record[k].team[j].teamPoints;
                                                                    totalBets += existingGame.record[k].team[j].teamBets;
                                                                    totalWins += existingGame.record[k].team[j].teamWon;
                                                                }   
                                                                existingGame.team[j].teamPoints = totalPoints;
                                                                existingGame.team[j].teamBets = totalBets;
                                                                existingGame.team[j].teamWon = totalWins;
                                                                setGame(existingGame);                                                                
                                                            }}
                                                            value={team.teamWon}
                                                            />
                                                            <h1 className="text-center text-sm text-zinc-500">Points Earned: {team.teamPoints}</h1>
                                                        </div>
                                                    </TableCell>
                                                )
                                            })
                                        }
                                        <TableCell className="w-12" />
                                    </TableRow>
                                )
                            })
                        }
                <TableRow className="items-center w-full">
                    <TableCell className="font-bold text-center">Total</TableCell>
                    {
                        game.team.map((team, index) => {
                            return (
                                <TableCell key={index} className="text-center min-w-[160px]">
                                    <div className="flex flex-col items-center gap-2">
                                        <h1 className="text-center text-sm text-zinc-500">Total Points: {team.teamPoints}</h1>
                                    </div>
                                </TableCell>
                            )
                        })
                    }
                    <TableCell className="w-12" />
                </TableRow>
            </TableBody>
            </Table>

            <div className="flex flex-col items-center justify-center gap-2 mt-5 mb-5">
                <h1 className="m-auto font-black text-[50px]">🏆 {winningTeam?.teamName}</h1>
            </div>
        </div>
    )
}