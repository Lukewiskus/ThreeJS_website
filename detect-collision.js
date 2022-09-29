
const earthPos = [-80, -25, 3.5, 16]
const moonPos = [14, 70, 10,25 ]
const yellowPos = [-80,-14, 34, 47]
export default function DetectCollision(x, y){
    //earth collision
    if(x > earthPos[0] && x < earthPos[1] && y > earthPos[2] && y < earthPos[3]){
        return 1
    } else if(x > moonPos[0] && x < moonPos[1] && y > moonPos[2] && y < moonPos[3]){
        return 2
    } else if(x > yellowPos[0] && x < yellowPos[1] && y > yellowPos[2] && y < yellowPos[3]){
        return 3
    }else{
        return 0
    }
}