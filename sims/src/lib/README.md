These files provide some basic "ECS"-like functionality.

There are some major departures from other existing implementations and the literature in general. Some of these I'm leaving as an exercise for future me to optimize. Others I am experimenting with the ergonomics.

# Runtime components

In a proper ECS system, components are usually stored not directly on their entity, but instead in a more efficient data structure that optimizes for data locality and the like
e.g. [bevy's TableRow](https://github.com/bevyengine/bevy/blob/a9622408665662eff9ddae83d913c6cfa2fa61d2/crates/bevy_ecs/src/storage/table.rs).

Some systems (ageSystem, wanderSystem) don't even pretend. They are clearly looping over the entities, which hold their own data direcly.

Others look like they might almost do some smart stuff (calcTransformSystems) using the "splitArray" which at first glance operates like it does something analogous to grabbing the components for processing. If we redo that function to actually only return the components, we could have something closer to using proper Archetypes & whatnot.

Another idea might be to provide a standard way to take out components then splice them back in if we are mutating the model.


# Systems Interface

Right now, we have a really simple interface for Systems: Model => Model

This makes it mad easy to author new ad-hoc components. Unfortunately, it also makes it appealing to pollute the high-level Model object (see Toasts, InputComponent).

# Component Function Members

Some of our components allow function arguments (calcTransformComponents) which take the Model/World
This makes it easy to check World-stuff like the time e.g.

```typescript
calculatePosition: [
{
    calculation: (m, e) => ({
    x:
        e.components.position.x +
        wiggle(m.time, Number.parseInt(e.id))[0],
    y:
        e.components.position.y +
        wiggle(m.time, Number.parseInt(e.id))[1],

    z:
        e.components.position.z +
        wiggle(m.time, Number.parseInt(e.id))[2],
    }),
} as CalcPositionComponent,
```

This is probably pretty bad, since each entity has its own function, which means a lot of memory overhead

# Functions in Component files

Some of the component files (e.g. AgeComponent, MetaDataComponent) provide
convenience util functions

Something about that feels wrong, but I'm not totally sure it is