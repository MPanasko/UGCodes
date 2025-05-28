from World import World
from Position import Position
from Organisms.Grass import Grass
from Organisms.Lynx import Lynx
from Organisms.Sheep import Sheep
from Organisms.Antylopa import Antylopa
import os

if __name__ == '__main__':
    pyWorld = World(10, 10)
    World.plague_active = False
    World.plague_remaining_turns = 0

    newOrg = Grass(position=Position(xPosition=9, yPosition=9), world=pyWorld)
    pyWorld.addOrganism(newOrg)

    newOrg = Grass(position=Position(xPosition=1, yPosition=1), world=pyWorld)
    pyWorld.addOrganism(newOrg)

    newOrg = Sheep(position=Position(xPosition=2, yPosition=2), world=pyWorld)
    pyWorld.addOrganism(newOrg)

    newOrg = Lynx(position=Position(xPosition=8, yPosition=3), world=pyWorld)
    pyWorld.addOrganism(newOrg)

    newOrg = Antylopa(position=Position(xPosition=4, yPosition=3), world=pyWorld)
    pyWorld.addOrganism(newOrg)

    print(pyWorld)



    for _ in range(50):
        if World.plague_active:
            World.apply_plague(pyWorld.organisms)
            World.plague_remaining_turns -= 1
            if World.plague_remaining_turns == 0:
                World.plague_active = False
                print("Plaga została dezaktywowana!")

        czyn = input('Jaką czynność chcesz zrobić? ')
        if czyn == 'p':
            print('Plaga została aktywowana!')
            World.plague_active = True
            World.plague_remaining_turns = 2
        elif czyn == 'da':
            print('dodanie antylopy')
            print('Ustaw pozycje organizmu')
            pozx = int(input('Pozycja x:'))
            pozy = int(input('Pozycja y:'))
            newOrg = Antylopa(position=Position(xPosition=pozx, yPosition=pozy), world=pyWorld)
            pyWorld.addOrganism(newOrg)
        elif czyn == 'ds':
            print('dodanie owcy')
            print('Ustaw pozycje organizmu')
            pozx = int(input('Pozycja x:'))
            pozy = int(input('Pozycja y:'))
            newOrg = Sheep(position=Position(xPosition=pozx, yPosition=pozy), world=pyWorld)
            pyWorld.addOrganism(newOrg)
        elif czyn == 'dr':
            print('dodanie Rysia')
            print('Ustaw pozycje organizmu')
            pozx = int(input('Pozycja x:'))
            pozy = int(input('Pozycja y:'))
            newOrg = Lynx(position=Position(xPosition=pozx, yPosition=pozy), world=pyWorld)
            pyWorld.addOrganism(newOrg)

        os.system('cls')
        pyWorld.makeTurn()
        print(pyWorld)

