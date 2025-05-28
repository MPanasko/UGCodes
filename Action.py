from ActionEnum import ActionEnum

class Action(object):

    def __init__(self, action, position, value, organism, message=None):
        self.__action = action
        self.__position = position
        self.__value = value
        self.__organism = organism
        self.__message = message

    @property
    def action(self):
        return self.__action

    @property
    def position(self):
        return self.__position

    @property
    def value(self):
        return self.__value

    @property
    def organism(self):
        return self.__organism

    @property
    def message(self):
        return self.__message

    def __str__(self):
        className = self.organism.__class__.__name__
        choice = {
            ActionEnum.A_ADD: '{0}: add at: {1}'.format(className, self.position),
            ActionEnum.A_INCREASEPOWER: '{0} increase power: {1}'.format(className, self.value),
            ActionEnum.A_MOVE: '{0} move form: {1} to: {2}'.format(className, self.organism.position, self.position),
            ActionEnum.A_REMOVE: '{0} remove form: {1}'.format(className, self.organism.position),
            ActionEnum.A_ATTACK: '{0} {1}'.format(className, self.message) if self.message else 'Unknown action'
        }
        return choice[self.action]
