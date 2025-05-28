from random import choice
from Action import Action
from ActionEnum import ActionEnum
from .Animal import Animal
from Organisms.Lynx import Lynx

class Antylopa(Animal):

    def __init__(self, antylopa=None, position=None, world=None):
        super(Antylopa, self).__init__(antylopa, position, world)

    def clone(self):
        return Antylopa(self, None, None)

    def initParams(self):
        self.power = 4
        self.initiative = 3
        self.liveLength = 11
        self.powerToReproduce = 5
        self.sign = 'A'

    def move(self):
        result = []
        pomPositions = self.getNeighboringPosition()
        newPosition = None

        if pomPositions:
            if self.is_lynx_nearby():
                newPosition = self.run_away_from_lynx(pomPositions)
            else:
                newPosition = choice(pomPositions)
            if newPosition:
                result.append(Action(ActionEnum.A_MOVE, newPosition, 0, self))
                self.lastPosition = self.position
                metOrganism = self.world.getOrganismFromPosition(newPosition)
                if metOrganism is not None:
                    result.extend(metOrganism.consequences(self))
        return result

    def run_away_from_lynx(self, positions):
        safe_positions = [pos for pos in positions if not isinstance(self.world.getOrganismFromPosition(pos), Lynx)]
        return choice(safe_positions) if safe_positions else None

    def is_lynx_nearby(self):
        for pos in self.world.getNeighboringPositions(self.position):
            organism = self.world.getOrganismFromPosition(pos)
            if isinstance(organism, Lynx):
                return True
        return False

    def attack(self):
        result = []
        target = None
        # Get neighboring positions where there are organisms
        neighboring_positions = self.world.getNeighboringPositions(self.position)
        # Filter out positions occupied by Lynx
        neighboring_lynx_positions = [pos for pos in neighboring_positions if
                                      isinstance(self.world.getOrganismFromPosition(pos), Lynx)]
        # If there are Lynxes nearby
        if neighboring_lynx_positions:
            # Choose a random neighboring position with a Lynx
            target_position = choice(neighboring_lynx_positions)
            target = self.world.getOrganismFromPosition(target_position)
            # Calculate the damage to be dealt (e.g., Lynx's power)
            damage = self.power
            # Inflict damage to the Lynx
            target.power -= damage
            # Check if the Lynx has been killed
            if target.power <= 0:
                # Remove the Lynx from the world
                result.append(Action(ActionEnum.A_REMOVE, target.position, 0, target))
                # Add a message indicating the attack and the result
                result.append(Action(ActionEnum.A_ATTACK, target.position, damage, target,
                                     "Antylopa is attacking and killed Lynx!"))
            else:
                # Add a message indicating the attack and the result
                result.append(
                    Action(ActionEnum.A_ATTACK, target.position, damage, target, "Antylopa is attacking Lynx!"))
        return result

    def can_run_away(self, lynx_positions):
        for pos in lynx_positions:
            lynx = self.world.getOrganismFromPosition(pos)
            if lynx.initiative > self.initiative:
                return False
            # Check if there is any obstacle blocking the path to escape
            neighboring_positions = self.world.getNeighboringPositions(self.position)
            if pos not in neighboring_positions:
                return False
        return True
