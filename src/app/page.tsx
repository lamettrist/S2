'use client';

import { useSessionstorageState } from "rooks";
import GameComponent, { gameSchema } from "@/lib/game";
import { Kbd, KbdGroup } from "@/components/ui/kbd";
import { CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { RxPlus } from "react-icons/rx";
import { useEffect, useState } from "react";
import { HiDotsVertical } from "react-icons/hi";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { SlPencil } from "react-icons/sl";
import { CgTrash } from "react-icons/cg";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";

export default function Home() {
  // const [gameTitle, setGameTitle] = useSessionstorageState("session-title", "Spades Game #1")
  const [gameTabs, setGameTabs] = useSessionstorageState<gameSchema[]>("game-tabs", [])
  const [activeTabId, setActiveTabId] = useSessionstorageState<string | null>('tab-id', null);
  const [activeGame, setActiveGame] = useSessionstorageState<gameSchema | null>('active-game', null);
  const [openOptionsId, setOpenOptionsId] = useState<string | null>(null);
  const [renameOptionsId, setRenameOptionsId] = useState<string | null>(null);
  const [previousTabSize, setPreviousTabSize] = useState(gameTabs.length);
  const userAgent = navigator.userAgent.toLowerCase();

  useEffect(() => {
    if (gameTabs.length < previousTabSize) {
      if (gameTabs.length == 0) {
        setActiveGame(null);
        setActiveTabId(null);
      } else {
        setActiveGame(gameTabs[gameTabs.length - 1] || null);
        setActiveTabId(gameTabs[gameTabs.length - 1].id || null);
      }
    }
    setPreviousTabSize(gameTabs.length);
  }, [gameTabs])

  // Update active game when content changes
  useEffect(() => {
    if (activeGame?.id == activeTabId) {
      let gameTabArray: gameSchema[] = [];
      for (let i = 0; i < gameTabs.length; i++) {
        if (gameTabs[i].id === activeTabId) {
          // @ts-expect-error Expect this error please
          gameTabArray.push(activeGame);
        } else {
          gameTabArray.push(gameTabs[i]);
        }
      }
      setGameTabs(gameTabArray); // there has to be a more efficient way of doing this than js beginner stuff
    }
  }, [activeTabId, activeGame])

  useEffect(() => {
    function handleKeybinds(event: KeyboardEvent) {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() == 'x') {
        event.preventDefault();
        event.stopPropagation();
        handleNewGame();
      } else if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() == 'c') {
        event.preventDefault();
        event.stopPropagation();
        setOpenOptionsId(openOptionsId === activeTabId ? null : activeTabId);
      } else if ((event.ctrlKey) && !isNaN(parseInt(event.key.toLowerCase()))) {
        if (parseInt(event.key.toLowerCase()) <= gameTabs.length) {
          setActiveGame(gameTabs[parseInt(event.key.toLowerCase()) - 1]);
          setActiveTabId(gameTabs[parseInt(event.key.toLowerCase()) - 1].id);
        }
      }
    }
    window.addEventListener("keydown", handleKeybinds);
    return () => window.removeEventListener("keydown", handleKeybinds);
  })


  function handleNewGame() {
    const newId = crypto.randomUUID();
    if (gameTabs.length >= 5) {
      toast.error("Session could not be created", 
        {
          'description': "You already have the maximum number of possible sessions you can play in parallel! Please conclude one of your current sessions to create a new one.",
        }
      )
    } else {
      let Recorder = [

      ]

      for (let i = 1; i <= 13; i++) {
        Recorder.push(
          {
            'round': i,
            'team': [{
              'teamName': 'Team 1',
              'teamPoints': 0,
              'teamBets': 0,                          
              'teamWon': 0,
            },
            {
              'teamName': 'Team 2',
              'teamPoints': 0,
              'teamBets': 0,                          
              'teamWon': 0,                     
            }
          ]}
        )
      }
      const game: gameSchema = {
        id: newId,
        name: `Spades Game #${gameTabs.length + 1}`,
        record: Recorder,
        team: [
          {
            'teamName': 'Team 1',
            'teamPoints': 0,
            'teamBets': 0,     
            'teamWon': 0,                     
          },
          {
            'teamName': 'Team 2',
            'teamPoints': 0,
            'teamBets': 0,     
            'teamWon': 0,                     
          }
        ],
      };
      setGameTabs([...gameTabs, game]);
      setActiveTabId(newId);
      setActiveGame(game);
    }
  }

  function deleteTab(id: string) {
    const tabs = gameTabs.filter((tab) => tab.id !== id);
    setGameTabs(tabs);
    setActiveTabId('');
    if (tabs.length === 0) {
      sessionStorage.clear();
    }
    setOpenOptionsId(null);
  }

  return (
    <>
      {/* Rename Dialog */}
      <Dialog open={renameOptionsId !== null} onOpenChange={(open) => {
        setRenameOptionsId(open ? renameOptionsId : null);
      }
      }>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Renaming {gameTabs.find((tab) => tab.id === renameOptionsId)?.name}</DialogTitle>
            <DialogDescription>
              Enter a new name for this game session.
            </DialogDescription>
          </DialogHeader>
          <form className="flex flex-col gap-1" onSubmit={(event) => {
            event.preventDefault();
            const newName = new FormData(event.currentTarget).get("new-game-name");
            let game: gameSchema = {
              // @ts-expect-error Expect this error please
              'id': activeGame?.id,
              'name': activeGame?.name || '',
              'record': activeGame?.record || [],
              'team': activeGame?.team || [],
            };
            // @ts-expect-error Expect this error please
            game.name = newName;
            let gameTabArray = [];
            for (let i = 0; i < gameTabs.length; i++) {
              if (gameTabs[i].id === renameOptionsId) {
                gameTabArray.push(game);
              } else {
                gameTabArray.push(gameTabs[i]);
              }
            }
            setGameTabs(gameTabArray);
            setActiveGame(game);
            setRenameOptionsId(null);
          }}>
            <Input
              placeholder="Lil' Tournament"
              type="text"
              name="new-game-name"
              className="ml-1 h-8 gap-2 w-full shrink-0 items-center justify-center rounded-xl"              
            />
            <b />
            <Button type="submit" 
            className="ml-1 h-8 gap-2 w-full shrink-0 items-center justify-center rounded-xl text-zinc-600 hover:text-white  font-bold transition-all duration-200 bg-zinc-200/70 cursor-pointer"
            >
              Rename
            </Button>
          </form>
        </DialogContent>
      </Dialog>
      {/* Tabs */}
      <nav className="w-[95%] h-[6vh] ml-auto mr-auto mt-2 rounded-2xl bg-zinc-100/80 backdrop-blur-sm border border-zinc-200/60 shadow-sm flex items-center gap-1 px-2 overflow-x-auto">
      {
        gameTabs.map((game) => {
          return (
            <>
              <Button
                key={game.id}
                onClick={() => {
                  setActiveTabId(game.id);
                  setActiveGame(game)                  
                }}
                className={cn(
                  "group relative cursor-pointer flex shrink-0 items-center gap-2 whitespace-nowrap rounded-xl px-3.5 py-2 text-sm font-medium transition-all duration-200",
                  (activeTabId === game.id)
                    ? "bg-white text-zinc-900 hover:text-white shadow-[0_1px_3px_rgba(0,0,0,0.08)]"
                    : "bg-zinc-400/60 text-black hover:text-white"
                )}
              >
                {game.name}
                {/* Triggering Dialog */}
                  <Dialog open={openOptionsId === game.id} onOpenChange={(open) => {
                    setOpenOptionsId(open ? game.id : null);
                  }}>
                    <DialogTrigger onClick={() => setOpenOptionsId(game.id)}>
                      <button
                            aria-label="Manage Game"
                            className="ml-1 flex h-8 w-8 shrink-0 items-center cursor-pointer justify-center rounded-xl text-zinc-400 transition-all duration-200 hover:bg-zinc-200/70 hover:text-zinc-900"
                          >
                            <HiDotsVertical className="h-4 w-4" /> 
                      </button>
                  </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Manage {game.name}</DialogTitle>
                    <DialogDescription>
                    </DialogDescription>
                      <Button
                            aria-label="Rename Tab"
                            className="ml-1 flex h-8 gap-2 w-full shrink-0 items-center justify-center rounded-xl text-zinc-600 hover:text-white  font-bold transition-all duration-200 bg-zinc-200/70 cursor-pointer"
                            onClick={() => {
                              setRenameOptionsId(game.id);
                            }}
                      >
                            <SlPencil />
                            Rename Tab
                      </Button>
                      <Button
                            aria-label="Conclude Game"
                            className="ml-1 flex h-8 gap-2 w-full shrink-0 items-center justify-center rounded-xl text-zinc-600 font-bold transition-all duration-200 bg-zinc-200/70 hover:text-white hover:bg-red-900 cursor-pointer"
                            onClick={() => {
                              deleteTab(game.id)
                            }}
                          >
                            <CgTrash />
                            Conclude Game
                      </Button>
                  </DialogHeader>
                </DialogContent>
                </Dialog>
              </Button>
            </>
          )
        })
      }
      {
        gameTabs.length < 5 ? (
          <button
                onClick={handleNewGame}
                aria-label="New game"
                className="ml-1 flex h-8 w-8 shrink-0 flex items-center justify-center rounded-xl text-zinc-400 transition-all duration-200 cursor-pointer hover:bg-zinc-200/70 hover:text-zinc-900"
              >
                <RxPlus className="h-4 w-4" /> 
          </button>
        ) : null
      }
      </nav>
      <main className="flex flex-col items-center w-full h-[calc(100vh-6vh)]">
          <div className="w-[90%] h-full flex flex-col justify-center">
            {
            (gameTabs.length == 0 || (activeGame == null)) ? (
              <>
                <CardTitle className="font-['Pliant'] font-bold text-4xl">
                  S2
                </CardTitle>
                <div className="flex gap-2 flex-row">
                  {
                    userAgent.includes('mac') ? (
                      <KbdGroup>
                        <Kbd>⌘</Kbd>
                        <span>+</span>
                        <Kbd>X</Kbd>
                        {/* <Kbd>⌃</Kbd> */}
                      </KbdGroup>
                    ) : (
                      <KbdGroup>
                        <Kbd>CTRL</Kbd>
                        <span>+</span>
                        <Kbd>X</Kbd>
                      </KbdGroup>
                    )
                  }
                  <p className="text-gray-400">to launch a new game tab</p>
                </div>
                <div className="flex gap-2 flex-row">
                  {
                    userAgent.includes('mac') ? (
                      <KbdGroup>
                        <Kbd>⌘</Kbd>
                        <span>+</span>
                        <Kbd>C</Kbd>
                        {/* <Kbd>⌃</Kbd> */}
                      </KbdGroup>
                    ) : (
                      <KbdGroup>
                        <Kbd>CTRL</Kbd>
                        <span>+</span>
                        <Kbd>C</Kbd>
                      </KbdGroup>
                    )
                  }
                  <p className="text-gray-400">to open game tab settings</p>
                </div>
                <div className="flex gap-2 flex-row">
                  <KbdGroup>
                    <Kbd>CTRL</Kbd>
                    <span>+</span>
                    <Kbd><b>number</b></Kbd>
                    {/* <Kbd>⌃</Kbd> */}
                  </KbdGroup>
                  <p className="text-gray-400">to switch between tabs</p>
                </div>
              </>
            ) : (
              <>
                {/* <h1 className="text-6xl font-black">{activeGame.name}</h1> */}
                <GameComponent game={activeGame} setGame={setActiveGame} />
              </>
            )
          }
        </div>
      </main>
    </>
  );
}
