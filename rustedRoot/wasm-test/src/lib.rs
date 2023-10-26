mod utils;

use bevy::prelude::*;
use std::fmt;
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
#[repr(u8)]
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum Cell {
    Dead = 0,
    Alive = 1,
}

fn setup(
    mut commands: Commands,
    mut meshes: ResMut<Assets<Mesh>>,
    mut materials: ResMut<Assets<StandardMaterial>>,
) {
    commands.spawn(PbrBundle {
        mesh: meshes.add(shape::Plane::from_size(5.0).into()),
        material: materials.add(Color::rgb(0.3, 0.5, 0.3).into()),
        ..default()
    });
    commands.spawn(PointLightBundle {
        point_light: PointLight {
            intensity: 1500.0,
            shadows_enabled: true,
            ..default()
        },
        transform: Transform::from_xyz(4.0, 8.0, 4.0),
        ..default()
    });
    commands.spawn(Camera3dBundle {
        transform: Transform::from_xyz(4.0, 8.0, 4.0).looking_at(
            Vec3 {
                x: 0.0,
                y: 0.0,
                z: 0.0,
            },
            Vec3 {
                x: 0.0,
                y: 1.0,
                z: 0.0,
            },
        ),
        ..default()
    });
}

#[wasm_bindgen(start)]
pub fn bevy_main() {
    App::new()
        .add_plugins(DefaultPlugins.set(WindowPlugin {
            primary_window: Some(Window {
                canvas: Some("#bevy_canvas".to_string()),
                fit_canvas_to_parent: true,
                ..default()
            }),
            ..default()
        }))
        .add_systems(Startup, setup)
        .run();
}

#[wasm_bindgen]
pub struct World {
    width: u32,
    height: u32,
    cells: Vec<Cell>,
}

impl World {
    fn get_index(&self, row: u32, column: u32) -> usize {
        (row * self.width + column) as usize
    }

    fn get_live_neighbors(&self, row: u32, column: u32) -> u32 {
        let (top, bot) = match row {
            r if r == 0 => (self.height - 1, r + 1),
            r if r == self.height - 1 => (r - 1, 0),
            r => (r - 1, r + 1),
        };
        let (left, right) = match column {
            c if c == 0 => (self.width - 1, c + 1),
            c if c == self.width - 1 => (c - 1, 0),
            c => (c - 1, c + 1),
        };
        let mut count = 0;
        for (r, c) in [
            (top, left),
            (top, column),
            (top, right),
            (row, left),
            (row, column),
            (row, right),
            (bot, left),
            (bot, column),
            (bot, right),
        ]
        .iter()
        .cloned()
        {
            count += self.cells[self.get_index(r, c)] as u32;
        }
        count
    }

    fn get_state(&self, row: u32, col: u32) -> Cell {
        let idx = self.get_index(row, col);
        self.cells[idx]
    }
}

#[wasm_bindgen]
impl World {
    pub fn new() -> World {
        utils::utils::set_panic_hook();
        let width = 64;
        let height = 64;

        let cells = (0..width * height)
            .map(|i| {
                if i % 2 == 0 || i % 7 == 0 {
                    Cell::Alive
                } else {
                    Cell::Dead
                }
            })
            .collect();

        World {
            width,
            height,
            cells,
        }
    }

    pub fn render(&self) -> String {
        self.to_string()
    }

    pub fn tick(&mut self) {
        let mut next = self.cells.clone();

        for row in 0..self.height {
            for col in 0..self.width {
                let alive = self.get_state(row, col);
                let alive_neighbors = self.get_live_neighbors(row, col);
                let next_state = match (alive, alive_neighbors) {
                    (Cell::Alive, n) if n < 2 => Cell::Dead,
                    (Cell::Alive, 2) | (Cell::Alive, 3) => Cell::Alive,
                    (Cell::Alive, n) if n > 3 => Cell::Dead,
                    (Cell::Dead, n) if n == 3 => Cell::Alive,
                    (otherwise, _) => otherwise,
                };
                next[self.get_index(row, col)] = next_state;
            }
        }
        self.cells = next;
    }
}

impl fmt::Display for World {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        for r in 0..self.height {
            for c in 0..self.width {
                let glyph = match self.get_state(r, c) {
                    Cell::Dead => '_',
                    Cell::Alive => 'x',
                };
                write!(f, "{}", glyph)?;
            }
            write!(f, "\n")?;
        }
        Ok(())
    }
}
