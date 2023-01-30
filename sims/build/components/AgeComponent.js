export function getAge(modelTime, age) {
    const hbd = age?.birthday !== undefined ? age.birthday : 0;
    return modelTime - hbd;
}
