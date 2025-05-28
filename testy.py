import unittest
from World import World
from Position import Position
from Organisms.Lynx import Lynx
from Organisms.Antylopa import Antylopa
from ActionEnum import ActionEnum



class TestWorldFunctionality(unittest.TestCase):

    def test_lynx_existence(self):
        pyWorld = World(10, 10)
        newOrg = Lynx(position=Position(xPosition=8, yPosition=3), world=pyWorld)
        pyWorld.addOrganism(newOrg)
        self.assertIn(newOrg, pyWorld.organisms)

    def test_plague(self):
        pyWorld = World(10, 10)
        pyWorld.apply_plague = True
        self.assertTrue(pyWorld.apply_plague)

    def test_adding(self):
        pyWorld = World(10, 10)
        pozx = 1
        pozy = 1
        newOrg = Antylopa(position=Position(xPosition=pozx, yPosition=pozy), world=pyWorld)
        pyWorld.addOrganism(newOrg)
        self.assertIn(newOrg, pyWorld.organisms)

    def test_antylopa_attacks_lynx(self):
        pyWorld = World(10, 10)
        antylopa_position = Position(xPosition=5, yPosition=5)
        lynx_position = Position(xPosition=6, yPosition=5)
        antylopa = Antylopa(position=antylopa_position, world=pyWorld)
        lynx = Lynx(position=lynx_position, world=pyWorld)
        lynx.initParams()
        pyWorld.addOrganism(antylopa)
        pyWorld.addOrganism(lynx)
        initial_lynx_power = lynx.power
        actions = antylopa.attack()
        attack_actions = [action for action in actions if action.action == ActionEnum.A_ATTACK]
        self.assertGreater(len(attack_actions), 0)
        self.assertLess(lynx.power, initial_lynx_power)
        for action in attack_actions:
            print(action)


if __name__ == '__main__':
    unittest.main()
